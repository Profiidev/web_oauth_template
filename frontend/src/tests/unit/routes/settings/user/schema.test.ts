import { describe, expect, it } from 'vitest';
import {
  reformat,
  unReformat,
  userSettings
} from '$routes/settings/user/schema.svelte';
import type { UserSettings } from '$lib/client';

describe('userSettings schema', () => {
  it('accepts a disabled config and applies defaults', () => {
    const r = userSettings.safeParse({});
    expect(r.success).toBe(true);
    expect(r.data?.oidc_enabled).toBe(false);
    expect(r.data?.oidc_client_secret).toBe('');
    expect(r.data?.sso_create_user).toBe(false);
  });

  it('flags the required fields when OIDC is enabled', () => {
    const r = userSettings.safeParse({ oidc_enabled: true });
    expect(r.success).toBe(false);
    const paths = r.error?.issues.map((i) => i.path[0]);
    expect(paths).toContain('oidc_issuer');
    expect(paths).toContain('oidc_client_id');
  });

  it('accepts an enabled config with issuer and client id', () => {
    const r = userSettings.safeParse({
      oidc_client_id: 'client',
      oidc_enabled: true,
      oidc_issuer: 'https://issuer.example.com'
    });
    expect(r.success).toBe(true);
  });
});

describe('reformat', () => {
  it('drops fields that are configured from the environment', () => {
    const form = userSettings.parse({
      oidc_client_id: 'client',
      oidc_enabled: true,
      oidc_issuer: 'https://issuer.example.com'
    });
    const out = reformat(form, ['oidc_client_id']);
    expect('oidc_client_id' in out).toBe(false);
    expect(out.oidc_issuer).toBe('https://issuer.example.com');
  });
});

describe('unReformat', () => {
  it('fills defaults for an empty settings object', () => {
    const out = unReformat({} as unknown as UserSettings);
    expect(out.oidc_enabled).toBe(false);
    expect(out.oidc_client_secret).toBe('');
    expect(out.oidc_pkce).toBe(false);
  });
});
