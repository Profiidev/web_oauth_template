<script lang="ts">
  import { Button } from '@profidev/pleiades/components/ui/button';
  import FormDialog from '@profidev/pleiades/components/form/form-dialog.svelte';
  import Plus from '@lucide/svelte/icons/plus';
  import Table from '$lib/components/table/Table.svelte';
  import { columns } from './table.svelte';
  import { z } from 'zod';
  import { toast } from '@profidev/pleiades/components/util/general';
  import { invalidate } from '$app/navigation';
  import { Permission } from '$lib/permissions.svelte';
  import { deleteGroup, type GroupInfo } from '$lib/client';

  const { data } = $props();

  let selected: GroupInfo | undefined = $state();
  let deleteOpen = $state(false);
  let isLoading = $state(false);

  $effect(() => {
    if (data.error) {
      if (data.error === 'group_not_found') {
        toast.error('Group not found');
      } else if (data.error === 'group_other') {
        toast.error('Failed to load group');
      }

      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url);
    }
  });

  const deleteItemConfirm = async () => {
    if (!selected) return;

    isLoading = true;
    let ret = await deleteGroup({ body: { uuid: selected.id } });
    isLoading = false;

    if (ret.error) {
      return { error: 'Failed to delete group' };
    } else {
      toast.success(`Group ${selected.name} deleted successfully`);
      invalidate((url) => url.pathname.startsWith('/api/groups'));
    }
  };

  const startDeleteGroup = (item: GroupInfo) => {
    selected = item;
    deleteOpen = true;
  };
</script>

<div class="p-4">
  <div class="ml-7 flex items-center md:m-0">
    <h3 class="text-xl font-medium">Groups</h3>
    <Button
      class="ml-auto cursor-pointer"
      href="/groups/create"
      disabled={!data.user?.permissions.includes(Permission.GROUP_EDIT)}
    >
      <Plus />
      Create
    </Button>
  </div>
  <Table
    data={data.groups}
    {columns}
    class="mt-4"
    columnData={{
      deleteGroup: startDeleteGroup,
      user: data.user,
      admin_group: data.admin_group ?? undefined
    }}
  />
</div>
<FormDialog
  title={`Delete Group`}
  description={`Do you really want to delete the group ${selected?.name}?`}
  confirm="Delete"
  confirmVariant="destructive"
  onsubmit={deleteItemConfirm}
  bind:open={deleteOpen}
  bind:isLoading
  schema={z.object({})}
/>
