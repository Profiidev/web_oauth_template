import type { PageLoad } from './$types';
import { authConfig } from '$lib/client';
import { getRedirectTarget } from '$lib/redirect';

export const load: PageLoad = ({ fetch, url }) => {
  const error = url.searchParams.get('error') || undefined;
  const redirectTo = getRedirectTarget(url.searchParams);
  if (error) {
    return { error, redirectTo };
  }
  const skip = url.searchParams.get('skip') === 'true';

  const config = authConfig({ fetch }).then(({ data }) => data);
  return { config, redirectTo, skip };
};
