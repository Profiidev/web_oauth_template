import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { groupInfo, listCachesSimpleGroup, listUsersSimple } from '$lib/client';

export const load: PageLoad = async ({ params, fetch }) => {
  let resPromise = groupInfo({
    path: { uuid: params.uuid },
    fetch
  });
  let usersPromise = listUsersSimple({ fetch });
  let cachesPromise = listCachesSimpleGroup({ fetch });

  let [res, users, caches] = await Promise.all([
    resPromise,
    usersPromise,
    cachesPromise
  ]);

  if (!res.data) {
    if (res.response.status === 404) {
      redirect(307, '/groups?error=group_not_found');
    } else {
      redirect(307, '/groups?error=group_other');
    }
  }

  return {
    uuid: params.uuid,
    group: res.data,
    users: users.data,
    caches: caches.data
  };
};
