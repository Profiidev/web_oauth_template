import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { type UserSettings, getOidcSettings, isSetup } from '$lib/client';
import { unReformat } from '../settings/user/schema.svelte';

export const load: PageLoad = async ({ fetch }) => {
  const { data: status } = await isSetup({ fetch });
  const { data: settings } = await getOidcSettings({ fetch });

  if (status?.is_setup) {
    redirect(302, '/');
  }
  //
  // Check if any key in settings was already configured by the user
  let configured = false;
  for (const key in settings?.settings) {
    if (
      // oxlint-disable-next-line no-unsafe-type-assertion
      settings?.settings[key as keyof UserSettings] &&
      !settings.from_env.includes(key)
    ) {
      configured = true;
      break;
    }
  }

  if (settings) {
    settings.settings = unReformat(settings.settings);
  }

  return {
    configured,
    db_backend: status?.db_backend ?? 'unknown',
    settings
  };
};
