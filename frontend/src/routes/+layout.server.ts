import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types.js';
import { noAuthPaths } from '$lib/components/nav.svelte.js';

export const load: LayoutServerLoad = ({ cookies, route }) => {
  const cookie = cookies.get('centaurus_jwt');

  if (!cookie && !noAuthPaths.includes(route.id ?? '')) {
    redirect(302, '/login');
  }
};
