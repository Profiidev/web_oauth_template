import { describe, expect, it } from 'vitest';
import { load as accountLoad } from '$routes/account/+page.server';
import { load as passwordLoad } from '$routes/password/+page.server';
import { load as settingsLoad } from '$routes/settings/+page.server';
import { catchRedirect } from '$test_helpers/load';

describe('index redirects', () => {
  it.each([
    ['account', accountLoad, '/account/general'],
    ['password', passwordLoad, '/password/forgot'],
    ['settings', settingsLoad, '/settings/user']
  ])('%s redirects to %s', async (_name, load, location) => {
    const redirect = await catchRedirect(() => (load as () => unknown)());
    expect(redirect.status).toBe(302);
    expect(redirect.location).toBe(location);
  });
});
