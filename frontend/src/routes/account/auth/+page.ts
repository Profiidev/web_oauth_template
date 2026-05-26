import { mailActive } from "$lib/client";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ fetch }) => {
  const mailPromise = mailActive({ fetch }).then(
    (res) => res.data?.active ?? false,
  );

  return {
    mailActive: mailPromise,
  };
};
