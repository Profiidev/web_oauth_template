import { mailActive } from "$lib/client";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ fetch }) => {
  const active = mailActive({
    fetch,
  }).then(({ data }) => data?.active ?? false);
  return {
    mailActive: active,
  };
};
