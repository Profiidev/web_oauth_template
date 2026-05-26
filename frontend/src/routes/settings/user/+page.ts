import { getGeneralSettings, getUserSettings } from "$lib/client";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ fetch }) => {
  const fetchSettings = getUserSettings({ fetch }).then(({ data }) => data);
  const fetchGeneralSettings = getGeneralSettings({ fetch }).then(
    ({ data }) => data,
  );

  return {
    generalSettingsPromise: fetchGeneralSettings,
    settingsPromise: fetchSettings,
  };
};
