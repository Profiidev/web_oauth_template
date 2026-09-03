import { describe, expect, it } from 'vitest';
import {
  formatData,
  groupSettings,
  reformatData
} from '$routes/groups/[uuid]/schema.svelte';
import type { GroupDetails } from '$lib/client';

type GroupForm = Parameters<typeof reformatData>[0];

describe('groupSettings schema', () => {
  it('requires a name', () => {
    const r = groupSettings.safeParse({ name: '', users: [] });
    expect(r.success).toBe(false);
  });

  it('defaults every permission flag to false', () => {
    const r = groupSettings.safeParse({ name: 'g', users: [] });
    expect(r.success).toBe(true);
    expect(r.data?.group$view).toBe(false);
    expect(r.data?.settings$view).toBe(false);
  });
});

describe('reformatData', () => {
  it('converts the truthy permission flags to `resource:action` and skips name', () => {
    const data = {
      group$edit: false,
      group$view: true,
      name: 'Admins',
      settings$view: true,
      users: ['u1', 'u2']
    } as unknown as GroupForm;

    const result = reformatData(data, 'uuid-1');

    expect(result.name).toBe('Admins');
    expect(result.uuid).toBe('uuid-1');
    expect(result.users).toEqual(['u1', 'u2']);
    expect(result.permissions).toEqual(
      expect.arrayContaining(['settings:view', 'group:view'])
    );
    expect(result.permissions).not.toContain('group:edit');
    expect(result.permissions).not.toContain('Admins');
  });

  it('falls back to an empty users array when users is missing', () => {
    const data = { name: 'g', users: undefined } as unknown as GroupForm;
    expect(reformatData(data, 'x').users).toEqual([]);
  });
});

describe('formatData', () => {
  it('expands group details into a fully-populated form value', () => {
    const group = {
      id: 'gid',
      name: 'Admins',
      permissions: ['group:view', 'settings:view'],
      users: [{ id: 'u1' }, { id: 'u2' }]
    } as unknown as GroupDetails;

    const form = formatData(group);

    expect(form.name).toBe('Admins');
    expect(form.users).toEqual(['u1', 'u2']);
    expect(form.group$view).toBe(true);
    expect(form.settings$view).toBe(true);
    // An untouched permission stays false
    expect(form.user$edit).toBe(false);
  });
});
