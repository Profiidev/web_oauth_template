import { describe, expect, it } from 'vitest';
import { columns } from '$routes/users/table.svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cellProps = (cols: any[], key: string, original: unknown) =>
  cols.find((c) => c.accessorKey === key).cell({ row: { original } }).props;

describe('users table columns', () => {
  it('renders an avatar column wired to the user identity', () => {
    const cols = columns({ canEdit: true, deleteUser: () => {} });
    const props = cellProps(cols, 'avatar', { name: 'Bob', uuid: 'u1' });
    expect(props).toMatchObject({ userId: 'u1', username: 'Bob' });
  });

  it('enables actions when the user can edit', () => {
    const cols = columns({ canEdit: true, deleteUser: () => {} });
    const props = cellProps(cols, 'actions', { uuid: 'u1' });
    expect(props.edit_disabled).toBe(false);
    expect(props.delete_disabled).toBe(false);
    expect(props.edit).toBe('/users/u1');
  });

  it('disables actions when the user cannot edit', () => {
    const cols = columns({ canEdit: false, deleteUser: () => {} });
    const props = cellProps(cols, 'actions', { uuid: 'u1' });
    expect(props.edit_disabled).toBe(true);
    expect(props.delete_disabled).toBe(true);
  });
});
