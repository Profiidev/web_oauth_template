import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { isSetup } from '$lib/client';

export const load: PageLoad = async ({ fetch }) => {
  let { data: status } = await isSetup({ fetch });

  if (status?.is_setup) {
    redirect(302, '/');
  }

  return {
    db_backend: status?.db_backend ?? 'unknown',
    storage_backend: status?.storage_backend ?? 'unknown'
  };
};
