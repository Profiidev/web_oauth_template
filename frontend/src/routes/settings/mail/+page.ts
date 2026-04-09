import { getMailSettings } from '$lib/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  let settings = await getMailSettings({ fetch });
  return {
    settings: settings.data
  };
};
