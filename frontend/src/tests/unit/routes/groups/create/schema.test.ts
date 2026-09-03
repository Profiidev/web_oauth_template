import { describe, expect, it } from 'vitest';
import { information } from '$routes/groups/create/schema.svelte';

describe('group create information schema', () => {
  it('applies the empty-string default when name is absent (short-circuits min)', () => {
    const r = information.safeParse({});
    expect(r.success).toBe(true);
    expect(r.data?.name).toBe('');
  });

  it('rejects an explicitly empty name (min(1) runs)', () => {
    expect(information.safeParse({ name: '' }).success).toBe(false);
  });

  it('accepts a non-empty name', () => {
    expect(information.safeParse({ name: 'Admins' }).success).toBe(true);
  });
});
