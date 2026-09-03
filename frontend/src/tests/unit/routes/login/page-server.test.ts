import { describe, expect, it } from 'vitest';
import { load } from '$routes/login/+page.server';
import { catchRedirect, runLoad } from '$test_helpers/load';

const cookies = (value?: string) => ({ get: () => value });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ev = (props: Record<string, unknown>) => props as any;

describe('login +page.server load', () => {
  it('does nothing when unauthenticated', async () => {
    const result = await runLoad(load, {
      cookies: cookies(),
      url: new URL('http://x/login')
    });
    expect(result).toBeUndefined();
  });

  it('redirects an authenticated user on /login to /', async () => {
    const redirect = await catchRedirect(async () =>
      load(ev({ cookies: cookies('jwt'), url: new URL('http://x/login') }))
    );
    expect(redirect.status).toBe(302);
    expect(redirect.location).toBe('/');
  });

  it('redirects an authenticated user on /login to the redirect target', async () => {
    const redirect = await catchRedirect(async () =>
      load(
        ev({
          cookies: cookies('jwt'),
          url: new URL('http://x/login?redirect=%2Fusers')
        })
      )
    );
    expect(redirect.location).toBe('/users');
  });

  it('ignores an unsafe redirect param for authenticated users on /login', async () => {
    const redirect = await catchRedirect(async () =>
      load(
        ev({
          cookies: cookies('jwt'),
          url: new URL('http://x/login?redirect=//evil.com')
        })
      )
    );
    expect(redirect.location).toBe('/');
  });

  it('does not redirect an authenticated user already off /login', async () => {
    const result = await runLoad(load, {
      cookies: cookies('jwt'),
      url: new URL('http://x/elsewhere')
    });
    expect(result).toBeUndefined();
  });
});
