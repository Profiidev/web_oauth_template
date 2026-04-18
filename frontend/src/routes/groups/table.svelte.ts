import type { ColumnDef } from '@tanstack/table-core';
import * as DataTable from '@profidev/pleiades/components/ui/data-table';
import { createColumn } from '@profidev/pleiades/components/table/helpers.svelte';
import { Permission } from '$lib/permissions.svelte';
import type { GroupInfo, SimpleUserInfo, UserInfo } from '$lib/client';
import Actions from '@profidev/pleiades/components/table/actions.svelte';

export const columns = ({
  deleteGroup,
  user,
  admin_group
}: {
  deleteGroup: (group: GroupInfo) => void;
  user?: UserInfo;
  admin_group?: string;
}): ColumnDef<GroupInfo>[] => [
  createColumn('name', 'Name'),
  createColumn(
    'permissions',
    'Permissions',
    (permissions: string[]) => permissions.join(', ') || 'No Permissions'
  ),
  createColumn(
    'users',
    'Users',
    (users: SimpleUserInfo[]) =>
      users.map((u) => u.name).join(', ') || 'No Users'
  ),
  createColumn('id', 'UUID'),
  {
    accessorKey: 'actions',
    header: () => {},
    cell: ({ row }) => {
      let disabled =
        !user?.permissions.includes(Permission.GROUP_EDIT) ||
        row.original.id === admin_group ||
        row.original.permissions.some(
          (p) => !user?.permissions.includes(p as Permission)
        );

      return DataTable.renderComponent(Actions, {
        edit_disabled: disabled,
        delete_disabled: disabled,
        edit: `/groups/${row.original.id}`,
        remove: () => deleteGroup(row.original)
      });
    },
    enableHiding: false
  }
];
