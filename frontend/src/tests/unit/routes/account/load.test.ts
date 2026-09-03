import { describe, expect, it } from 'vitest';
import { load as authLoad } from '$routes/account/auth/+page';
import { jsonFetch, runLoad } from '$test_helpers/load';

describe('account auth load', () => {
  it('derives mailActive from the active flag', async () => {
    const result = await runLoad(authLoad, {
      fetch: jsonFetch({ active: true })
    });
    await expect(result.mailActive).resolves.toBe(true);
  });

  it('defaults mailActive to false without data', async () => {
    const result = await runLoad(authLoad, { fetch: jsonFetch(null) });
    await expect(result.mailActive).resolves.toBe(false);
  });
});
