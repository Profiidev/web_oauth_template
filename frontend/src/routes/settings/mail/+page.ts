import { getMailSettings } from '$lib/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  const settings = await getMailSettings({ fetch });
  return {
    settings: settings.data
  };
};
