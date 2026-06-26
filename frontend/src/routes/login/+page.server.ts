import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getRedirectTarget } from '$lib/redirect';

export const load: PageServerLoad = ({ cookies, url }) => {
  const cookie = cookies.get('centaurus_jwt');

  if (cookie && url.pathname === '/login') {
    redirect(302, getRedirectTarget(url.searchParams));
  }
};
