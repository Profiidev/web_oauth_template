<script lang="ts">
  import { Separator } from 'positron-components/components/ui/separator';
  import { Button } from 'positron-components/components/ui/button';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import Trash from '@lucide/svelte/icons/trash';
  import { Permission } from '$lib/permissions.svelte';
  import FormDialog from 'positron-components/components/form/form-dialog.svelte';
  import { z } from 'zod';
  import { toast } from 'positron-components/components/util/general';
  import { goto } from '$app/navigation';
  import BaseForm from 'positron-components/components/form/base-form.svelte';
  import { formatData, groupSettings, reformatData } from './schema.svelte.js';
  import type { FormValue } from 'positron-components/components/form/types';
  import FormInput from 'positron-components/components/form/form-input.svelte';
  import Save from '@lucide/svelte/icons/save';
  import { Spinner } from 'positron-components/components/ui/spinner';
  import FormSelect from 'positron-components/components/form/form-select.svelte';
  import Permissions from './Permissions.svelte';
  import CacheAccess from './CacheAccess.svelte';
  import { ScrollArea } from 'positron-components/components/ui/scroll-area';
  import { deleteGroup, editGroup } from '$lib/client';

  const { data } = $props();

  let deleteOpen = $state(false);
  let isLoading = $state(false);
  let readonly = $derived(
    !data.user?.permissions.includes(Permission.GROUP_EDIT)
  );
  let mappings = $derived(data.group.caches);

  const deleteItemConfirm = async () => {
    isLoading = true;
    let ret = await deleteGroup({ body: { uuid: data.group.id } });
    isLoading = false;

    if (ret.error) {
      return { error: 'Failed to delete group' };
    } else {
      toast.success(`Group ${data.group.name} deleted successfully`);
      setTimeout(() => {
        goto('/groups');
      });
    }
  };

  const onsubmit = async (form: FormValue<typeof groupSettings>) => {
    let group = reformatData(form, data.group.id, mappings);
    let res = await editGroup({ body: group });

    if (res.error) {
      if (res.response.status === 409) {
        return { error: 'This group name is already in use', field: 'name' };
      } else {
        return { error: 'Failed to update group' };
      }
    } else {
      toast.success(`Group ${data.group.name} updated successfully`);
      // do not trigger form reset
      return { error: '' };
    }
  };
</script>

<div class="flex h-full max-h-screen min-h-0 w-full flex-col space-y-6 p-4">
  <div class="mt-1! mb-0 ml-7 flex items-center md:m-0">
    <Button size="icon" variant="ghost" href="/groups" class="mr-2">
      <ArrowLeft class="size-5" />
    </Button>
    <h3 class="text-xl font-medium">Group: {data.group.name}</h3>
    <Button
      class="ml-auto cursor-pointer"
      onclick={() => (deleteOpen = true)}
      variant="destructive"
      disabled={readonly}
    >
      <Trash />
      Delete
    </Button>
  </div>
  <Separator class="my-4" />
  <div class="flex min-h-0 grow flex-col space-y-4 lg:space-y-0 lg:space-x-6">
    <h4 class="mb-2">Settings</h4>
    <BaseForm
      class="flex min-h-0 grow flex-col"
      schema={groupSettings}
      {onsubmit}
      initialValue={formatData(data.group)}
    >
      {#snippet children({ props })}
        <ScrollArea class="mt-2 min-h-0">
          <div
            class="grid min-h-0 grow grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr]"
          >
            <div>
              <FormInput
                {...props}
                key="name"
                label="Group Name"
                placeholder="Enter group name"
                {readonly}
              />
              <FormSelect
                {...props}
                key="users"
                label="Group Members"
                data={data.users?.map((user) => ({
                  label: user.name,
                  value: user.id
                })) || []}
              />
              <Permissions user={data.user} {readonly} {...props} />
              <CacheAccess
                caches={data.caches ?? []}
                bind:mappings
                disabled={!data.user?.permissions.includes(
                  Permission.CACHE_EDIT
                ) || isLoading}
              />
            </div>
          </div>
        </ScrollArea>
      {/snippet}
      {#snippet footer({ isLoading }: { isLoading: boolean })}
        <div class="mt-4 grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
          <Button
            class="ml-auto cursor-pointer"
            type="submit"
            disabled={isLoading}
          >
            {#if isLoading}
              <Spinner />
            {:else}
              <Save />
            {/if}
            Save Changes</Button
          >
        </div>
      {/snippet}
    </BaseForm>
  </div>
</div>
<FormDialog
  title={`Delete Group`}
  description={`Do you really want to delete the group ${data.group.name}?`}
  confirm="Delete"
  confirmVariant="destructive"
  onsubmit={deleteItemConfirm}
  bind:open={deleteOpen}
  bind:isLoading
  schema={z.object({})}
/>
