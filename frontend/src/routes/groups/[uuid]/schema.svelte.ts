import type { EditGroupRequest, GroupDetails } from '$lib/client';
import type { FormValue } from '@profidev/pleiades/components/form/types';
import { z } from 'zod';

export const groupSettings = z.object({
  name: z.string().min(1, 'Group name is required'),
  users: z.array(z.string()),
  settings_view: z.boolean().default(false),
  settings_edit: z.boolean().default(false),
  group_view: z.boolean().default(false),
  group_edit: z.boolean().default(false),
  user_view: z.boolean().default(false),
  user_edit: z.boolean().default(false),
  cache_create: z.boolean().default(false),
  cache_view: z.boolean().default(false),
  cache_edit: z.boolean().default(false)
});

export const reformatData = (
  data: FormValue<typeof groupSettings>,
  uuid: string
): EditGroupRequest => {
  const permissions: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== 'name' && value === true) {
      permissions.push(key.replace('_', ':'));
    }
  }

  return {
    uuid,
    name: data.name,
    permissions,
    users: data.users || []
  };
};

export const formatData = (
  group: GroupDetails
): FormValue<typeof groupSettings> => {
  const formattedData: FormValue<typeof groupSettings> = {
    name: group.name,
    settings_view: false,
    settings_edit: false,
    group_view: false,
    group_edit: false,
    user_view: false,
    user_edit: false,
    cache_create: false,
    cache_view: false,
    cache_edit: false,
    users: group.users.map((user) => user.id)
  };

  for (const permission of group.permissions) {
    const key = permission.replace(':', '_') as keyof FormValue<
      typeof groupSettings
    >;
    // @ts-ignore
    formattedData[key] = true;
  }

  return formattedData;
};
