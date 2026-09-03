import { describe, expect, it } from 'vitest';
import { login } from '$routes/login/schema.svelte';

describe('login schema', () => {
  it('accepts a valid email and password', () => {
    expect(login.safeParse({ email: 'a@b.com', password: 'pw' }).success).toBe(
      true
    );
  });

  it('rejects an invalid email', () => {
    expect(
      login.safeParse({ email: 'not-an-email', password: 'pw' }).success
    ).toBe(false);
  });

  it('rejects an empty password', () => {
    expect(login.safeParse({ email: 'a@b.com', password: '' }).success).toBe(
      false
    );
  });
});
