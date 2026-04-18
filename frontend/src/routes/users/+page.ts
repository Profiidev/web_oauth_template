import { listUsers } from '$lib/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
  const { data: users } = await listUsers({ fetch });
  return {
    error: url.searchParams.get('error'),
    users
  };
};
