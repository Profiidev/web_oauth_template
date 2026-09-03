import { describe, expect, it } from 'vitest';
import { OIDC_ERRORS, Permission, avatarUrl } from '$lib/permissions.svelte';

describe('Permission enum', () => {
  it('maps every member to a `resource:action` string', () => {
    for (const value of Object.values(Permission)) {
      expect(value).toMatch(/^[a-z_]+:[a-z_]+$/);
    }
  });

  it('has unique values', () => {
    const values = Object.values(Permission);
    expect(new Set(values).size).toBe(values.length);
  });

  it('exposes the expected members', () => {
    expect(Permission.SETTINGS_VIEW).toBe('settings:view');
    expect(Permission.SETTINGS_EDIT).toBe('settings:edit');
    expect(Permission.GROUP_VIEW).toBe('group:view');
    expect(Permission.GROUP_EDIT).toBe('group:edit');
    expect(Permission.USER_VIEW).toBe('user:view');
    expect(Permission.USER_EDIT).toBe('user:edit');
  });

  it('pairs a view and edit permission for each resource', () => {
    const resources = new Set(
      Object.values(Permission).map((p) => p.split(':')[0])
    );
    for (const resource of resources) {
      const actions = Object.values(Permission)
        .filter((p) => p.startsWith(`${resource}:`))
        .map((p) => p.split(':')[1]);
      expect(actions).toEqual(expect.arrayContaining(['view', 'edit']));
    }
  });
});

describe('url constants', () => {
  it('exposes an absolute api path for the avatar endpoint', () => {
    expect(avatarUrl).toBe('/api/user/info/avatar');
    expect(avatarUrl.startsWith('/api/')).toBe(true);
  });
});

describe('OIDC_ERRORS', () => {
  it('maps every known code to an "SSO login failed" message', () => {
    for (const message of Object.values(OIDC_ERRORS)) {
      expect(message.startsWith('SSO login failed:')).toBe(true);
    }
  });

  it('covers the common OIDC failure codes', () => {
    expect(OIDC_ERRORS.missing_code).toBe(
      'SSO login failed: Missing authorization code.'
    );
    expect(OIDC_ERRORS.oidc_not_configured).toBe(
      'SSO login failed: OIDC is not configured.'
    );
  });
});
