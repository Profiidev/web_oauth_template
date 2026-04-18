import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { noSidebarPaths } from '$lib/components/nav.svelte';
import { info, isSetup } from '$lib/client';

export const load: LayoutLoad = async ({ fetch, url }) => {
  const { data: status, error } = await isSetup({ fetch });
  if (error) {return {};}

  if (!status?.is_setup && url.pathname !== '/setup') {
    redirect(302, '/setup');
  }

  if (!status?.is_setup && url.pathname === '/setup') {
    return {};
  }

  const { data: user, response } = await info({ fetch });

  if (
    !user &&
    response.status !== 401 &&
    !noSidebarPaths.includes(url.pathname) &&
    !status?.is_setup
  ) {
    redirect(302, '/setup');
  }

  return {
    user
  };
};
