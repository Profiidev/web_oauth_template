import type { PageLoad } from './$types';
import { authConfig } from '$lib/client';

export const load: PageLoad = ({ fetch, url }) => {
  const error = url.searchParams.get('error') || undefined;
  if (error) {
    return { error };
  }
  const skip = url.searchParams.get('skip') === 'true';

  const config = authConfig({ fetch }).then(({ data }) => data);
  return { config, skip };
};
