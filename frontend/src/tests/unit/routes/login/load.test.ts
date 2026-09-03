import { describe, expect, it } from 'vitest';
import { load } from '$routes/login/+page';
import { jsonFetch, runLoad } from '$test_helpers/load';

describe('login load', () => {
  it('short-circuits with the error when one is in the query', async () => {
    const result = await runLoad(load, {
      fetch: jsonFetch(null),
      url: new URL('http://x/login?error=boom')
    });
    expect(result).toEqual({ error: 'boom', redirectTo: '/' });
  });

  it('loads the auth config when there is no error', async () => {
    const result = await runLoad(load, {
      fetch: jsonFetch({ sso_type: 'None' }),
      url: new URL('http://x/login')
    });
    expect(result.error).toBeUndefined();
    expect(result.redirectTo).toBe('/');
    expect(result.skip).toBe(false);
    await expect(result.config).resolves.toEqual({ sso_type: 'None' });
  });

  it('exposes a validated redirect target from the query string', async () => {
    const result = await runLoad(load, {
      fetch: jsonFetch({ sso_type: 'None' }),
      url: new URL('http://x/login?redirect=%2Fusers')
    });
    expect(result.redirectTo).toBe('/users');
  });

  it('ignores an unsafe redirect param', async () => {
    const result = await runLoad(load, {
      fetch: jsonFetch({ sso_type: 'None' }),
      url: new URL('http://x/login?redirect=//evil.com')
    });
    expect(result.redirectTo).toBe('/');
  });

  it('reads the skip flag from the query', async () => {
    const result = await runLoad(load, {
      fetch: jsonFetch({ sso_type: 'None' }),
      url: new URL('http://x/login?skip=true')
    });
    expect(result.skip).toBe(true);
  });
});
