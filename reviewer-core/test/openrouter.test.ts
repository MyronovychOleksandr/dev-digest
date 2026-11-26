import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { OpenRouterProvider } from '../src/llm/openrouter.js';

/**
 * Cost attribution of a structured call: the SDK client is replaced with a stub,
 * so no network is touched.
 */
const Out = z.object({ ok: z.boolean() });

const BAD = '{"nope":1}';
const GOOD = '{"ok":true}';

type Usage = { prompt_tokens?: number; completion_tokens?: number; cost?: number };

function reply(content: string, usage?: Usage) {
  return { choices: [{ message: { content } }], ...(usage ? { usage } : {}) };
}

function run(
  replies: ReturnType<typeof reply>[],
  estimate = vi.fn((_m: string, _in: number, _out: number): number | null => 0.5),
) {
  const provider = new OpenRouterProvider('test-key', { estimateCost: estimate });
  const create = vi.fn();
  for (const r of replies) create.mockResolvedValueOnce(r);
  (provider as unknown as { client: unknown }).client = { chat: { completions: { create } } };
  const result = provider.completeStructured({
    model: 'm',
    schema: Out,
    schemaName: 'Out',
    messages: [{ role: 'user', content: 'hi' }],
  });
  return { result, estimate };
}

describe('OpenRouterProvider cost attribution', () => {
  it('sums usage.cost across retries and does not estimate', async () => {
    const { result, estimate } = run([
      reply(BAD, { prompt_tokens: 100, completion_tokens: 10, cost: 0.001 }),
      reply(GOOD, { prompt_tokens: 120, completion_tokens: 12, cost: 0.002 }),
    ]);
    const res = await result;
    expect(res.costUsd).toBeCloseTo(0.003, 12);
    expect(res.tokensIn).toBe(220);
    expect(res.tokensOut).toBe(22);
    expect(estimate).not.toHaveBeenCalled();
  });

  it('keeps a real zero cost from the API (free model)', async () => {
    const { result, estimate } = run([
      reply(GOOD, { prompt_tokens: 100, completion_tokens: 10, cost: 0 }),
    ]);
    expect((await result).costUsd).toBe(0);
    expect(estimate).not.toHaveBeenCalled();
  });

  it('estimates from tokens when usage.cost is absent', async () => {
    const { result, estimate } = run([reply(GOOD, { prompt_tokens: 100, completion_tokens: 10 })]);
    expect((await result).costUsd).toBe(0.5);
    expect(estimate).toHaveBeenCalledWith('m', 100, 10);
  });

  it('estimates over ALL tokens instead of returning a partial API sum', async () => {
    const { result, estimate } = run([
      reply(BAD, { prompt_tokens: 100, completion_tokens: 10, cost: 0.001 }),
      reply(GOOD, { prompt_tokens: 120, completion_tokens: 12 }),
    ]);
    expect((await result).costUsd).toBe(0.5);
    expect(estimate).toHaveBeenCalledWith('m', 220, 22);
  });

  it('returns null when the model is unknown to the estimator', async () => {
    const { result } = run(
      [reply(GOOD, { prompt_tokens: 100, completion_tokens: 10 })],
      vi.fn((_m: string, _in: number, _out: number): number | null => null),
    );
    expect((await result).costUsd).toBeNull();
  });

  it.each<[string, Usage]>([
    ['empty', {}],
    ['all zeros', { prompt_tokens: 0, completion_tokens: 0 }],
    ['only prompt tokens', { prompt_tokens: 100 }],
  ])('returns null (not $0) for %s usage without cost', async (_name, usage) => {
    const { result, estimate } = run([reply(GOOD, usage)]);
    expect((await result).costUsd).toBeNull();
    expect(estimate).not.toHaveBeenCalled();
  });

  it('returns null when one retry has empty usage', async () => {
    const { result, estimate } = run([
      reply(BAD, {}),
      reply(GOOD, { prompt_tokens: 120, completion_tokens: 12, cost: 0.002 }),
    ]);
    expect((await result).costUsd).toBeNull();
    expect(estimate).not.toHaveBeenCalled();
  });

  it('keeps an API cost that comes without token counts', async () => {
    const { result } = run([reply(GOOD, { cost: 0.004 })]);
    expect((await result).costUsd).toBe(0.004);
  });

  it('returns null (not $0) when any attempt carries no usage', async () => {
    const { result, estimate } = run([
      reply(BAD),
      reply(GOOD, { prompt_tokens: 120, completion_tokens: 12, cost: 0.002 }),
    ]);
    expect((await result).costUsd).toBeNull();
    expect(estimate).not.toHaveBeenCalled();
  });
});
