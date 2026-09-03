import { describe, expect, it } from 'vitest';
import { mailSettings, unReformat } from '$routes/settings/mail/schema.svelte';
import type { MailSettings } from '$lib/client';

describe('mailSettings schema', () => {
  it('accepts a disabled config and applies defaults', () => {
    const r = mailSettings.safeParse({
      smtp_enabled: false,
      smtp_use_tls: false
    });
    expect(r.success).toBe(true);
    expect(r.data?.smtp_from_name).toBe('Positron');
    expect(r.data?.smtp_password).toBe('');
  });

  it('accepts an enabled config with all required fields present', () => {
    const r = mailSettings.safeParse({
      smtp_enabled: true,
      smtp_from_address: 'mail@x.com',
      smtp_port: 587,
      smtp_server: 'smtp.x.com',
      smtp_use_tls: true,
      smtp_username: 'user'
    });
    expect(r.success).toBe(true);
  });

  it('flags each missing required field when SMTP is enabled', () => {
    const r = mailSettings.safeParse({
      smtp_enabled: true,
      smtp_use_tls: false
    });
    expect(r.success).toBe(false);
    const paths = r.error?.issues.map((i) => i.path[0]);
    expect(paths).toContain('smtp_server');
    expect(paths).toContain('smtp_port');
    expect(paths).toContain('smtp_username');
    expect(paths).toContain('smtp_from_address');
    // Smtp_from_name has a default of 'Positron', so it is never missing
    expect(paths).not.toContain('smtp_from_name');
  });
});

describe('unReformat', () => {
  it('fills server defaults for an empty settings object', () => {
    const settings = {} as unknown as MailSettings;
    expect(unReformat(settings)).toEqual({
      smtp_enabled: false,
      smtp_from_address: undefined,
      smtp_from_name: 'Positron',
      smtp_password: '',
      smtp_port: undefined,
      smtp_server: undefined,
      smtp_use_tls: false,
      smtp_username: undefined
    });
  });

  it('preserves provided values', () => {
    const settings = {
      smtp_enabled: true,
      smtp_from_name: 'Custom',
      smtp_port: 25,
      smtp_use_tls: true
    } as unknown as MailSettings;
    const out = unReformat(settings);
    expect(out.smtp_enabled).toBe(true);
    expect(out.smtp_from_name).toBe('Custom');
    expect(out.smtp_port).toBe(25);
    expect(out.smtp_use_tls).toBe(true);
  });
});
