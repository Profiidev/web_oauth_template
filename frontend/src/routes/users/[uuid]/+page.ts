import type { PageLoad } from './$types';
import { listGroupsSimple, userInfo } from '$lib/client';

export const load: PageLoad = ({ params, fetch }) => {
  const resPromise = userInfo({
    fetch,
    path: { uuid: params.uuid }
  });
  const groupsPromise = listGroupsSimple({
    fetch
  }).then((res) => res.data ?? []);

  return {
    groupsPromise,
    userInfoPromise: resPromise,
    uuid: params.uuid
  };
};
