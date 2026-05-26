import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies, url }) => {
  const cookie = cookies.get('centaurus_jwt');

  if (cookie && url.pathname === '/login') {
    redirect(302, '/');
  }
};
