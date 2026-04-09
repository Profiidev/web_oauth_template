import type { CacheMapping, UserEditReq, DetailUserInfo } from '$lib/client';
import type { FormValue } from 'positron-components/components/form/types';
import { z } from 'zod';

export const userSettings = z.object({
  name: z.string().min(1, 'User name is required'),
  groups: z.array(z.string())
});

export const reformatData = (
  data: FormValue<typeof userSettings>,
  uuid: string,
  caches: CacheMapping[]
): UserEditReq => {
  return {
    uuid,
    name: data.name,
    groups: data.groups || [],
    caches: caches
  };
};

export const formatData = (
  user: DetailUserInfo
): FormValue<typeof userSettings> => {
  return {
    name: user.name,
    groups: user.groups.map((group) => group.uuid)
  };
};

export const resetPassword = z.object({
  new_password: z.string().min(6, 'Password must be at least 6 characters long')
});
