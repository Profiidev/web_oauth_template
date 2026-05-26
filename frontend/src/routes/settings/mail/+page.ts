import { getMailSettings } from '$lib/client';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ fetch }) => {
  const settings = getMailSettings({ fetch }).then(({ data }) => data);
  return {
    settings
  };
};
