import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { SsoType, authConfig } from '$lib/client';
import { getOidcUrl } from '$lib/backend/auth.svelte';

export const load: PageLoad = async ({ fetch, url }) => {
  const error = url.searchParams.get('error') || undefined;
  if (error) {
    return { error };
  }
  const skip = url.searchParams.get('skip') === 'true';

  const { data: config } = await authConfig({ fetch });
  if (config?.sso_type !== SsoType.NONE) {
    const oidcUrl = await getOidcUrl();
    if (oidcUrl && config?.instant_redirect && !skip) {
      redirect(302, oidcUrl);
    }
    return { config, oidc_url: oidcUrl, skip };
  }
  return { config, skip };
};
