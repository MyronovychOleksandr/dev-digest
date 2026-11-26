import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { OpenAIProvider } from '../src/adapters/llm/openai.js';
import { estimateCost } from '../src/adapters/llm/pricing.js';

/**
 * Cost attribution of a structured call: the SDK client is replaced with a stub,
 * so no network is touched.
 */
const Out = z.object({ ok: z.boolean() });

const BAD = '{"nope":1}';
const GOOD = '{"ok":true}';
const MODEL = 'gpt-4.1';

type Usage = { prompt_tokens?: number; completion_tokens?: number };

function reply(content: string, usage?: Usage) {
  return { choices: [{ message: { content } }], ...(usage ? { usage } : {}) };
}

function run(replies: ReturnType<typeof reply>[]) {
  const provider = new OpenAIProvider('test-key');
  const create = vi.fn();
  for (const r of replies) create.mockResolvedValueOnce(r);
  (provider as unknown as { client: unknown }).client = { chat: { completions: { create } } };
  return provider.completeStructured({
    model: MODEL,
    schema: Out,
    schemaName: 'Out',
    messages: [{ role: 'user', content: 'hi' }],
  });
}

describe('OpenAIProvider cost attribution', () => {
  it('estimates over the tokens of all attempts', async () => {
    const res = await run([
      reply(BAD, { prompt_tokens: 100, completion_tokens: 10 }),
      reply(GOOD, { prompt_tokens: 120, completion_tokens: 12 }),
    ]);
    expect(res.tokensIn).toBe(220);
    expect(res.tokensOut).toBe(22);
    expect(res.costUsd).toBe(estimateCost(MODEL, 220, 22));
    expect(res.costUsd).toBeGreaterThan(0);
  });

  it.each<[string, Usage | undefined]>([
    ['absent', undefined],
    ['empty', {}],
    ['all zeros', { prompt_tokens: 0, completion_tokens: 0 }],
    ['only prompt tokens', { prompt_tokens: 100 }],
  ])('returns null (not $0) when usage is %s', async (_name, usage) => {
    expect((await run([reply(GOOD, usage)])).costUsd).toBeNull();
  });

  const full: Usage = { prompt_tokens: 100, completion_tokens: 10 };

  it.each<[string, Usage | undefined, Usage | undefined]>([
    ['first', undefined, full],
    ['last', full, undefined],
  ])('returns null when only the %s attempt lacks usage', async (_name, first, last) => {
    const res = await run([reply(BAD, first), reply(GOOD, last)]);
    expect(res.attempts).toBe(2);
    expect(res.costUsd).toBeNull();
  });
});
