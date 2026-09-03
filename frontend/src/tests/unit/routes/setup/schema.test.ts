import { describe, expect, it } from 'vitest';
import { adminUser, databaseSetupSchema } from '$routes/setup/schema.svelte';

describe('databaseSetupSchema', () => {
  it('accepts when the disclaimer is accepted', () => {
    expect(
      databaseSetupSchema.safeParse({ disclaimerAccepted: true }).success
    ).toBe(true);
  });

  it('rejects when the disclaimer is not accepted', () => {
    const r = databaseSetupSchema.safeParse({ disclaimerAccepted: false });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe(
      'You must accept the disclaimer to proceed.'
    );
  });
});

describe('adminUser schema', () => {
  const valid = { email: 'a@b.com', password: 'secret', username: 'abc' };

  it('accepts a valid admin user', () => {
    expect(adminUser.safeParse(valid).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(adminUser.safeParse({ ...valid, email: 'nope' }).success).toBe(
      false
    );
  });

  it('rejects a password shorter than six characters', () => {
    expect(adminUser.safeParse({ ...valid, password: '12345' }).success).toBe(
      false
    );
  });

  it('rejects a username shorter than three characters', () => {
    expect(adminUser.safeParse({ ...valid, username: 'ab' }).success).toBe(
      false
    );
  });
});
