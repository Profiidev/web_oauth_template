import { describe, expect, it } from 'vitest';
import { columns } from '$routes/groups/table.svelte';
import { Permission } from '$lib/permissions.svelte';
import type { GroupInfo, UserInfo } from '$lib/client';

const actionsProps = (
  args: Parameters<typeof columns>[0],
  original: Partial<GroupInfo>
) => {
  const cols = columns(args);
  const actions = cols.find(
    (c) => 'accessorKey' in c && c.accessorKey === 'actions'
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rendered = (actions as any).cell({ row: { original } });
  return rendered.props as {
    delete_disabled: boolean;
    edit: string;
    edit_disabled: boolean;
  };
};

const admin = {
  permissions: [Permission.GROUP_EDIT, Permission.USER_VIEW]
} as unknown as UserInfo;

describe('groups table columns', () => {
  it('builds the expected set of columns ending in actions', () => {
    const cols = columns({ deleteGroup: () => {} });
    expect(cols.length).toBe(5);
    expect(cols.at(-1)).toMatchObject({ accessorKey: 'actions' });
  });

  it('disables actions entirely when there is no user', () => {
    const props = actionsProps({ deleteGroup: () => {} }, { id: 'g1' });
    expect(props.edit_disabled).toBe(true);
    expect(props.delete_disabled).toBe(true);
  });

  it('disables actions when the user lacks group:edit', () => {
    const user = {
      permissions: [Permission.GROUP_VIEW]
    } as unknown as UserInfo;
    const props = actionsProps(
      { deleteGroup: () => {}, user },
      { id: 'g1', permissions: [] }
    );
    expect(props.edit_disabled).toBe(true);
  });

  it('disables actions when the group has a permission the user lacks', () => {
    const props = actionsProps(
      { deleteGroup: () => {}, user: admin },
      { id: 'g1', permissions: ['settings:edit'] }
    );
    expect(props.edit_disabled).toBe(true);
  });

  it('enables actions when the user can edit and outranks the group', () => {
    const props = actionsProps(
      { deleteGroup: () => {}, user: admin },
      { id: 'g1', permissions: ['user:view'] }
    );
    expect(props.edit_disabled).toBe(false);
    expect(props.delete_disabled).toBe(false);
    expect(props.edit).toBe('/groups/g1');
  });

  it('still blocks deletion of the configured admin group', () => {
    const props = actionsProps(
      { admin_group: 'g1', deleteGroup: () => {}, user: admin },
      { id: 'g1', permissions: ['user:view'] }
    );
    expect(props.edit_disabled).toBe(false);
    expect(props.delete_disabled).toBe(true);
  });
});
