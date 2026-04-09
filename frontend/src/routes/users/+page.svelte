<script lang="ts">
  import { Button } from 'positron-components/components/ui/button';
  import FormDialog from 'positron-components/components/form/form-dialog.svelte';
  import Plus from '@lucide/svelte/icons/plus';
  import Table from '$lib/components/table/Table.svelte';
  import { columns } from './table.svelte';
  import { z } from 'zod';
  import { toast } from 'positron-components/components/util/general';
  import { invalidate } from '$app/navigation';
  import { Permission } from '$lib/permissions.svelte';
  import { deleteUser, type UserListInfo } from '$lib/client';

  const { data } = $props();

  let selected: UserListInfo | undefined = $state();
  let deleteOpen = $state(false);
  let isLoading = $state(false);

  $effect(() => {
    if (data.error) {
      if (data.error === 'user_not_found') {
        toast.error('User not found');
      } else if (data.error === 'user_other') {
        toast.error('Failed to load user');
      }

      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url);
    }
  });

  const deleteItemConfirm = async () => {
    if (!selected) return;

    isLoading = true;
    let ret = await deleteUser({
      body: {
        uuid: selected.uuid
      }
    });
    isLoading = false;

    if (ret.error) {
      return { error: 'Failed to delete user' };
    } else {
      toast.success(`User ${selected.name} deleted successfully`);
      invalidate((url) => url.pathname.startsWith('/api/users'));
    }
  };

  const startDeleteUser = (item: UserListInfo) => {
    selected = item;
    deleteOpen = true;
  };
</script>

<div class="p-4">
  <div class="ml-7 flex items-center md:m-0">
    <h3 class="text-xl font-medium">Users</h3>
    <Button
      class="ml-auto cursor-pointer"
      href="/users/create"
      disabled={!data.user?.permissions.includes(Permission.USER_EDIT)}
    >
      <Plus />
      Create
    </Button>
  </div>
  <Table
    data={data.users}
    {columns}
    class="mt-4"
    columnData={{
      deleteUser: startDeleteUser,
      user: data.user
    }}
  />
</div>
<FormDialog
  title={`Delete User`}
  description={`Do you really want to delete the user ${selected?.name}?`}
  confirm="Delete"
  confirmVariant="destructive"
  onsubmit={deleteItemConfirm}
  bind:open={deleteOpen}
  bind:isLoading
  schema={z.object({})}
/>
