import { describe, expect, it } from 'vitest';
import { load } from '$routes/setup/+page';
import { catchRedirect, jsonFetch, runLoad } from '$test_helpers/load';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const event = (fetch: typeof globalThis.fetch) => ({ fetch }) as any;

describe('setup load', () => {
  it('redirects to / when setup is already complete', async () => {
    const redirect = await catchRedirect(async () =>
      load(
        event(
          jsonFetch({
            db_backend: 'SQLite',
            is_setup: true
          })
        )
      )
    );
    expect(redirect.status).toBe(302);
    expect(redirect.location).toBe('/');
  });

  it('returns the db backend when setup is not complete', async () => {
    const result = await runLoad(
      load,
      event(
        jsonFetch({
          db_backend: 'PostgreSQL',
          from_env: [],
          is_setup: false,
          settings: {}
        })
      )
    );
    expect(result.db_backend).toBe('PostgreSQL');
    expect(result.configured).toBe(false);
  });

  it('falls back to "unknown" when data is missing', async () => {
    const result = await runLoad(load, event(jsonFetch(null)));
    expect(result.db_backend).toBe('unknown');
    expect(result.configured).toBe(false);
  });
});
