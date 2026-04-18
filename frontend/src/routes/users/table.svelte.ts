import type { ColumnDef } from '@tanstack/table-core';
import * as DataTable from '@profidev/pleiades/components/ui/data-table';
import { createColumn } from '@profidev/pleiades/components/table/helpers.svelte';
import { Permission } from '$lib/permissions.svelte';
import SimpleAvatar from '@profidev/pleiades/components/util/simple-avatar.svelte';
import type { SimpleGroupInfo, UserInfo, UserListInfo } from '$lib/client';
import Actions from '@profidev/pleiades/components/table/actions.svelte';

export const columns = ({
  deleteUser,
  user
}: {
  deleteUser: (user: UserListInfo) => void;
  user?: UserInfo;
}): ColumnDef<UserListInfo>[] => [
  {
    accessorKey: 'avatar',
    cell: ({ row }) =>
      DataTable.renderComponent(SimpleAvatar, {
        class: 'size-8',
        src: row.getValue('avatar') as string // oxlint-disable-line no-unnecessary-type-assertion
      }),
    header: () => {},
    size: 10
  },
  createColumn('name', 'Name'),
  createColumn('email', 'Email'),
  createColumn(
    'groups',
    'Groups',
    (groups: SimpleGroupInfo[]) =>
      groups.map((u) => u.name).join(', ') || 'No Groups'
  ),
  createColumn('uuid', 'UUID'),
  {
    accessorKey: 'actions',
    cell: ({ row }) => {
      const disabled = !user?.permissions.includes(Permission.USER_EDIT);

      return DataTable.renderComponent(Actions, {
        delete_disabled: disabled,
        edit: `/users/${row.original.uuid}`,
        edit_disabled: disabled,
        remove: () => deleteUser(row.original)
      });
    },
    enableHiding: false,
    header: () => {}
  }
];
