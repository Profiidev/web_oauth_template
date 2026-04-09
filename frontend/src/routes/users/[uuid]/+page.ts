import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { listGroupsSimple, mailActive, userInfo } from '$lib/client';

export const load: PageLoad = async ({ params, fetch }) => {
  let resPromise = userInfo({
    path: { uuid: params.uuid },
    fetch
  });
  let groupsPromise = listGroupsSimple({
    fetch
  });
  let mailPromise = mailActive({ fetch });

  let [res, groups, mail] = await Promise.all([
    resPromise,
    groupsPromise,
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
    mailActive: mail.data?.active ?? false
  };
};
