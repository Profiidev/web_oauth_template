import type { ColumnDef } from '@tanstack/table-core';
import * as DataTable from '@profidev/pleiades/components/ui/data-table';
import { createColumn } from '@profidev/pleiades/components/table/helpers.svelte';
import type { SimpleGroupInfo, UserListInfo } from '$lib/client';
import Actions from '@profidev/pleiades/components/table/actions.svelte';
import UserAvatar from '@profidev/pleiades/components/util/user-avatar.svelte';

export const columns = ({
  deleteUser,
  canEdit
}: {
  deleteUser: (user: UserListInfo) => void;
  canEdit: boolean;
}): ColumnDef<UserListInfo>[] => [
  {
    accessorKey: 'avatar',
    cell: ({ row }) =>
      DataTable.renderComponent(UserAvatar, {
        class: 'size-8',
        userId: row.original.uuid,
        username: row.original.name
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
    cell: ({ row }) =>
      DataTable.renderComponent(Actions, {
        delete_disabled: !canEdit,
        edit: `/users/${row.original.uuid}`,
        edit_disabled: !canEdit,
        remove: () => deleteUser(row.original)
      }),
    enableHiding: false,
    header: () => {}
  }
];
