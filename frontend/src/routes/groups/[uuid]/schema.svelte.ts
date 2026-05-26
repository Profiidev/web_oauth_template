import type { EditGroupRequest, GroupDetails } from "$lib/client";
import type { FormValue } from "@profidev/pleiades/components/form/types";
import { z } from "zod";

export const groupSettings = z.object({
  group$edit: z.boolean().default(false),
  group$view: z.boolean().default(false),
  name: z.string().min(1, "Group name is required"),
  settings$edit: z.boolean().default(false),
  settings$view: z.boolean().default(false),
  user$edit: z.boolean().default(false),
  user$view: z.boolean().default(false),
  users: z.array(z.string()),
});

export const reformatData = (
  data: FormValue<typeof groupSettings>,
  uuid: string,
): EditGroupRequest => {
  const permissions: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (key !== "name" && value === true) {
      permissions.push(key.replace("$", ":"));
    }
  }

  return {
    name: data.name,
    permissions,
    users: data.users || [],
    uuid,
  };
};

export const formatData = (
  group: GroupDetails,
): FormValue<typeof groupSettings> => {
  const formattedData: FormValue<typeof groupSettings> = {
    // oxlint-disable-next-line no-unsafe-type-assertion
    ...(Object.fromEntries(
      Object.keys(groupSettings.shape).map((key) => [key, false]),
    ) as unknown as FormValue<typeof groupSettings>),
    name: group.name,
    users: group.users.map((user) => user.id),
  };

  for (const permission of group.permissions) {
    // oxlint-disable-next-line no-unsafe-type-assertion
    const key = permission.replace(":", "$") as keyof FormValue<
      typeof groupSettings
    >;
    // @ts-ignore
    formattedData[key] = true;
  }

  return formattedData;
};
