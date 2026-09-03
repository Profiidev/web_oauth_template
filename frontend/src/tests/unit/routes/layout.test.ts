import { describe, expect, it } from 'vitest';
import { load as layoutLoad } from '$routes/+layout';
import { load as layoutServerLoad } from '$routes/+layout.server';
import { noAuthPaths } from '$lib/components/nav.svelte';
import { catchRedirect, jsonFetch, runLoad } from '$test_helpers/load';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ev = (props: Record<string, unknown>) => props as any;

describe('+layout.ts load', () => {
  it('falls back to an Unknown User when info returns no data', async () => {
    const result = await runLoad(layoutLoad, { fetch: jsonFetch(null) });
    await expect(result.user).resolves.toMatchObject({
      name: 'Unknown User',
      permissions: []
    });
  });

  it('resolves the real user when info returns data', async () => {
    const user = {
      email: 'a@b.com',
      name: 'Bob',
      oidc_user: false,
      permissions: ['user:view'],
      totp_enabled: false,
      uuid: 'u1'
    };
    const result = await runLoad(layoutLoad, { fetch: jsonFetch(user) });
    await expect(result.user).resolves.toMatchObject({ name: 'Bob' });
  });

  it('exposes the setup status promise', async () => {
    const result = await runLoad(layoutLoad, {
      fetch: jsonFetch({ is_setup: true })
    });
    await expect(result.setupStatus).resolves.toMatchObject({
      data: { is_setup: true }
    });
  });
});

const cookies = (value?: string) => ({ get: () => value });

describe('+layout.server.ts load', () => {
  it('redirects to /login when unauthenticated on a protected path', async () => {
    const redirect = await catchRedirect(async () =>
      layoutServerLoad(
        ev({
          cookies: cookies(),
          route: { id: '/users' },
          url: new URL('http://x/users')
        })
      )
    );
    expect(redirect).toMatchObject({
      location: '/login?redirect=%2Fusers',
      status: 302
    });
  });

  it('preserves the query string in the redirect param', async () => {
    const redirect = await catchRedirect(async () =>
      layoutServerLoad(
        ev({
          cookies: cookies(),
          route: { id: '/users' },
          url: new URL('http://x/users?tab=1')
        })
      )
    );
    expect(redirect).toMatchObject({
      location: '/login?redirect=%2Fusers%3Ftab%3D1',
      status: 302
    });
  });

  it.each(noAuthPaths)(
    'allows an unauthenticated user on the public path %s',
    async (path) => {
      const result = await layoutServerLoad(
        ev({
          cookies: cookies(),
          route: { id: path },
          url: new URL(`http://x${path}`)
        })
      );
      expect(result).toBeUndefined();
    }
  );

  it('allows an authenticated user anywhere', async () => {
    const result = await layoutServerLoad(
      ev({
        cookies: cookies('jwt'),
        route: { id: '/users' },
        url: new URL('http://x/users')
      })
    );
    expect(result).toBeUndefined();
  });
});
