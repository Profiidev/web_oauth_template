import type { PageLoad } from "./$types";
import { listGroupsSimple, mailActive, userInfo } from "$lib/client";

export const load: PageLoad = ({ params, fetch }) => {
  const resPromise = userInfo({
    fetch,
    path: { uuid: params.uuid },
  });
  const groupsPromise = listGroupsSimple({
    fetch,
  }).then((res) => res.data ?? []);
  const mailPromise = mailActive({ fetch }).then(
    (res) => res.data?.active ?? false,
  );

  return {
    groupsPromise,
    mailActivePromise: mailPromise,
    userInfoPromise: resPromise,
    uuid: params.uuid,
  };
};
