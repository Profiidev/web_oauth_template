import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import {
  listCachesSimple,
  listGroupsSimple,
  mailActive,
  userInfoDetail
} from '$lib/client';

export const load: PageLoad = async ({ params, fetch }) => {
  let resPromise = userInfoDetail({
    path: { uuid: params.uuid },
    fetch
  });
  let groupsPromise = listGroupsSimple({
    fetch
  });
  let cachesPromise = listCachesSimple({ fetch });
  let mailPromise = mailActive({ fetch });

  let [res, groups, caches, mail] = await Promise.all([
    resPromise,
    groupsPromise,
    cachesPromise,
    mailPromise
  ]);

  if (!res.data) {
    if (res.response.status === 404) {
      redirect(307, '/users?error=user_not_found');
    } else {
      redirect(307, '/users?error=user_other');
    }
  }

  return {
    uuid: params.uuid,
    userInfo: res.data,
    groups: groups.data,
    caches: caches.data,
    mailActive: mail.data?.active ?? false
  };
};
