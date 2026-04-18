import { mailActive } from '$lib/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  const { data: active } = await mailActive({
    fetch
  });
  return {
    mailActive: active?.active ?? false
  };
};
