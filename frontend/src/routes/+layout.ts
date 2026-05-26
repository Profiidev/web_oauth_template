import type { LayoutLoad } from './$types';
import { type UserInfo, info, isSetup } from '$lib/client';

export const load: LayoutLoad = ({ fetch }) => {
  const setupStatus = isSetup({ fetch });
  const user: Promise<UserInfo> = info({ fetch }).then(
    ({ data }) =>
      data ?? {
        email: 'unknown@example.com',
        name: 'Unknown User',
        permissions: [],
        totp_enabled: false,
        uuid: ''
      }
  );

  return {
    setupStatus,
    user
  };
};
