import { describe, expect, it } from 'vitest';
import { forgotPassword } from '$routes/password/forgot/schema.svelte';

describe('forgotPassword schema', () => {
  it('accepts a valid email', () => {
    expect(forgotPassword.safeParse({ email: 'a@b.com' }).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(forgotPassword.safeParse({ email: 'nope' }).success).toBe(false);
  });
});
