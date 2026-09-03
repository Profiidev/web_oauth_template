import { describe, expect, it } from 'vitest';
import { load as resetLoad } from '$routes/password/reset/+page';
import { load as mailLoad } from '$routes/settings/mail/+page';
import { jsonFetch, runLoad } from '$test_helpers/load';

describe('password reset load', () => {
  it('reads the token from the query string', async () => {
    const withToken = await runLoad(resetLoad, {
      url: new URL('http://x/password/reset?token=abc')
    });
    expect(withToken.token).toBe('abc');

    const without = await runLoad(resetLoad, {
      url: new URL('http://x/password/reset')
    });
    expect(without.token).toBeNull();
  });
});

describe('mail settings load', () => {
  it('resolves the mail settings', async () => {
    const result = await runLoad(mailLoad, {
      fetch: jsonFetch({ smtp_enabled: true })
    });
    await expect(result.settings).resolves.toMatchObject({
      smtp_enabled: true
    });
  });
});
