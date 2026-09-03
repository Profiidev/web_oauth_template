import { describe, expect, it } from 'vitest';
import { load } from '$routes/settings/user/+page';
import { jsonFetch, runLoad } from '$test_helpers/load';

describe('settings/user load', () => {
  it('exposes the user-settings and general-settings promises', async () => {
    const result = await runLoad(load, {
      fetch: jsonFetch({ oidc_enabled: true, site_url: 'https://x/' })
    });

    await expect(result.settingsPromise).resolves.toMatchObject({
      oidc_enabled: true
    });
    await expect(result.generalSettingsPromise).resolves.toMatchObject({
      site_url: 'https://x/'
    });
  });
});
