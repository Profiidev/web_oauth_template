import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { isSetup } from '$lib/client';

export const load: PageLoad = async ({ fetch }) => {
  const { data: status } = await isSetup({ fetch });

  if (status?.is_setup) {
    redirect(302, '/');
  }

  return {
    db_backend: status?.db_backend ?? 'unknown'
  };
};
