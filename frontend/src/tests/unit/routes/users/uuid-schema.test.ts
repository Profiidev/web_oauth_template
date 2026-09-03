import { describe, expect, it } from 'vitest';
import {
  changeEmailSchema,
  formatData,
  reformatData,
  resetPassword,
  userSettings
} from '$routes/users/[uuid]/schema.svelte';
import type { DetailUserInfo } from '$lib/client';

type UserForm = Parameters<typeof reformatData>[0];

describe('userSettings schema', () => {
  it('requires a name', () => {
    expect(userSettings.safeParse({ groups: [], name: '' }).success).toBe(
      false
    );
    expect(userSettings.safeParse({ groups: [], name: 'Bob' }).success).toBe(
      true
    );
  });
});

describe('reformatData', () => {
  it('builds the edit request and keeps the uuid', () => {
    const data = { groups: ['g1'], name: 'Bob' };
    expect(reformatData(data, 'uid')).toEqual({
      groups: ['g1'],
      name: 'Bob',
      uuid: 'uid'
    });
  });

  it('falls back to an empty groups array when missing', () => {
    const data = { groups: undefined, name: 'Bob' } as unknown as UserForm;
    expect(reformatData(data, 'uid').groups).toEqual([]);
  });
});

describe('formatData', () => {
  it('maps group objects down to their uuids', () => {
    const user = {
      groups: [{ uuid: 'g1' }, { uuid: 'g2' }],
      name: 'Bob'
    } as unknown as DetailUserInfo;
    expect(formatData(user)).toEqual({ groups: ['g1', 'g2'], name: 'Bob' });
  });
});

describe('resetPassword + changeEmailSchema', () => {
  it('requires at least six characters for the new password', () => {
    expect(resetPassword.safeParse({ new_password: 'secret' }).success).toBe(
      true
    );
    expect(resetPassword.safeParse({ new_password: 'short' }).success).toBe(
      false
    );
  });

  it('validates the new email', () => {
    expect(changeEmailSchema.safeParse({ new_email: 'a@b.com' }).success).toBe(
      true
    );
    expect(changeEmailSchema.safeParse({ new_email: 'nope' }).success).toBe(
      false
    );
  });
});
