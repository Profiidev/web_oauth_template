import { listGroups } from "$lib/client";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ fetch, url }) => {
  const groups = listGroups({ fetch }).then(({ data }) => data);
  return {
    admin_group: groups.then((g) => g?.admin_group ?? undefined),
    error: url.searchParams.get("error"),
    groups: groups.then((g) => g?.groups ?? []),
  };
};
