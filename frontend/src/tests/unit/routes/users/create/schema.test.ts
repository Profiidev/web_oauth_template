import { describe, expect, it } from 'vitest';
import { information } from '$routes/users/create/schema.svelte';

describe('user create information schema', () => {
  it('applies defaults when fields are absent', () => {
    const r = information.safeParse({});
    expect(r.success).toBe(true);
    expect(r.data).toEqual({ email: '', name: '', password: '' });
  });

  it('rejects an invalid email when provided explicitly', () => {
    expect(information.safeParse({ email: 'nope', name: 'n' }).success).toBe(
      false
    );
  });

  it('rejects an explicitly empty name', () => {
    expect(information.safeParse({ email: 'a@b.com', name: '' }).success).toBe(
      false
    );
  });

  it('accepts a valid payload (password optional)', () => {
    expect(
      information.safeParse({ email: 'a@b.com', name: 'Bob' }).success
    ).toBe(true);
  });
});
