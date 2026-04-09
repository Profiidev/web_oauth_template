import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { authConfig, SsoType } from '$lib/client';
import { getOidcUrl } from '$lib/backend/auth.svelte';

export const load: PageLoad = async ({ fetch, url }) => {
  let error = url.searchParams.get('error') || null;
  if (error) {
    return { error };
  }
  let skip = url.searchParams.get('skip') === 'true';

  let { data: config } = await authConfig({ fetch });
  if (config?.sso_type !== SsoType.NONE) {
    let url = await getOidcUrl();
    if (url && config?.instant_redirect && !skip) {
      redirect(302, url);
    }
    return { oidc_url: url, config, skip };
  }
  return { config, skip };
};
