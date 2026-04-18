import { getGeneralSettings, getUserSettings } from '$lib/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  const fetchSettings = getUserSettings({ fetch });
  const fetchGeneralSettings = getGeneralSettings({ fetch });

  const [settings, generalSettings] = await Promise.all([
    fetchSettings,
    fetchGeneralSettings
  ]);

  return {
    generalSettings: generalSettings.data,
    settings: settings.data
  };
};
