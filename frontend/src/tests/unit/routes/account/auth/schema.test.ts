import { describe, expect, it } from 'vitest';
import {
  emailChangeSchema,
  passwordChange
} from '$routes/account/auth/schema.svelte';

describe('passwordChange schema', () => {
  it('accepts all three non-empty fields', () => {
    expect(
      passwordChange.safeParse({
        old_password: 'old',
        password: 'new',
        password_confirm: 'new'
      }).success
    ).toBe(true);
  });

  it('rejects a missing old password', () => {
    expect(
      passwordChange.safeParse({
        old_password: '',
        password: 'new',
        password_confirm: 'new'
      }).success
    ).toBe(false);
  });

  it('rejects an empty new password or confirmation', () => {
    expect(
      passwordChange.safeParse({
        old_password: 'old',
        password: '',
        password_confirm: 'new'
      }).success
    ).toBe(false);
    expect(
      passwordChange.safeParse({
        old_password: 'old',
        password: 'new',
        password_confirm: ''
      }).success
    ).toBe(false);
  });
});

describe('emailChangeSchema superRefine', () => {
  it('does not require codes when entering a new email (email_input true)', () => {
    const r = emailChangeSchema.safeParse({
      email: 'a@b.com',
      email_input: true,
      new_code: '',
      old_code: ''
    });
    expect(r.success).toBe(true);
  });

  it('requires both six-character codes when confirming (email_input false)', () => {
    const r = emailChangeSchema.safeParse({
      email: 'a@b.com',
      email_input: false,
      new_code: '',
      old_code: ''
    });
    expect(r.success).toBe(false);
    const paths = r.error?.issues.map((i) => i.path[0]);
    expect(paths).toContain('new_code');
    expect(paths).toContain('old_code');
  });

  it('flags a code that is not exactly six characters', () => {
    const r = emailChangeSchema.safeParse({
      email: 'a@b.com',
      email_input: false,
      new_code: '12345',
      old_code: '123456'
    });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.path[0])).toEqual(['new_code']);
  });

  it('passes when both codes are exactly six characters', () => {
    const r = emailChangeSchema.safeParse({
      email: 'a@b.com',
      email_input: false,
      new_code: '111111',
      old_code: '222222'
    });
    expect(r.success).toBe(true);
  });
});
