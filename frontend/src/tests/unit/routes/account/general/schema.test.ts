import { describe, expect, it } from 'vitest';
import { generalSettings } from '$routes/account/general/schema.svelte';

describe('account general settings schema', () => {
  it('requires a non-empty username', () => {
    expect(generalSettings.safeParse({ username: 'bob' }).success).toBe(true);
    expect(generalSettings.safeParse({ username: '' }).success).toBe(false);
  });
});
