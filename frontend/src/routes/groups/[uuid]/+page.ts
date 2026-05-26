import type { PageLoad } from './$types';
import { groupInfo, listUsersSimple } from '$lib/client';

export const load: PageLoad = ({ params, fetch }) => {
  const resPromise = groupInfo({
    fetch,
    path: { uuid: params.uuid }
  });
  const usersPromise = listUsersSimple({ fetch });

  return {
    groupRes: resPromise,
    usersPromise,
    uuid: params.uuid
  };
};
