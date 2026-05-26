import { listUsers } from "$lib/client";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ fetch, url }) => {
  const users = listUsers({ fetch }).then(({ data }) => data);
  return {
    error: url.searchParams.get("error"),
    users,
  };
};
