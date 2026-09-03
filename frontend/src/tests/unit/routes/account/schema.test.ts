import { describe, expect, it } from 'vitest';
import { confirmSchema } from '$routes/account/schema.svelte';

describe('account confirm schema', () => {
  it('requires a non-empty password', () => {
    expect(confirmSchema.safeParse({ password: 'pw' }).success).toBe(true);
    expect(confirmSchema.safeParse({ password: '' }).success).toBe(false);
  });
});
