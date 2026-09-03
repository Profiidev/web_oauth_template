import { describe, expect, it } from 'vitest';
import { resetPassword } from '$routes/password/reset/schema.svelte';

const base = {
  confirm_password: 'secret',
  new_password: 'secret',
  token: 'tok'
};

describe('resetPassword schema', () => {
  it('accepts matching passwords with a token', () => {
    expect(resetPassword.safeParse(base).success).toBe(true);
  });

  it('rejects a password shorter than six characters', () => {
    const r = resetPassword.safeParse({
      ...base,
      confirm_password: 'short',
      new_password: 'short'
    });
    expect(r.success).toBe(false);
  });

  it('rejects a missing token', () => {
    expect(resetPassword.safeParse({ ...base, token: '' }).success).toBe(false);
  });

  it('flags mismatched passwords on confirm_password', () => {
    const r = resetPassword.safeParse({
      ...base,
      confirm_password: 'different'
    });
    expect(r.success).toBe(false);
    expect(r.error?.issues.some((i) => i.path[0] === 'confirm_password')).toBe(
      true
    );
  });
});
