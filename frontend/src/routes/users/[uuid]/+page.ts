import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { listGroupsSimple, mailActive, userInfo } from '$lib/client';

export const load: PageLoad = async ({ params, fetch }) => {
  const resPromise = userInfo({
    fetch,
    path: { uuid: params.uuid }
  });
  const groupsPromise = listGroupsSimple({
    fetch
  });
  const mailPromise = mailActive({ fetch });

  const [res, groups, mail] = await Promise.all([
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
    groups: groups.data,
    mailActive: mail.data?.active ?? false,
    userInfo: res.data,
    uuid: params.uuid
  };
};
