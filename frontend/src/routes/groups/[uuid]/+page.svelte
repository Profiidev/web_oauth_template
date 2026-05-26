<script lang="ts">
  import { Separator } from '@profidev/pleiades/components/ui/separator';
  import { Button } from '@profidev/pleiades/components/ui/button';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import Trash from '@lucide/svelte/icons/trash';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import { Permission } from '$lib/permissions.svelte';
  import FormDialog from '@profidev/pleiades/components/form/form-dialog.svelte';
  import { z } from 'zod';
  import { toast } from '@profidev/pleiades/components/util/general';
  import { goto } from '$app/navigation';
  import BaseForm from '@profidev/pleiades/components/form/base-form.svelte';
  import { formatData, groupSettings, reformatData } from './schema.svelte.js';
  import type { FormValue } from '@profidev/pleiades/components/form/types';
  import FormInput from '@profidev/pleiades/components/form/form-input.svelte';
  import Save from '@lucide/svelte/icons/save';
  import { Spinner } from '@profidev/pleiades/components/ui/spinner';
  import FormSelect from '@profidev/pleiades/components/form/form-select.svelte';
  import Permissions from './Permissions.svelte';
  import { ScrollArea } from '@profidev/pleiades/components/ui/scroll-area';
  import {
    deleteGroup,
    editGroup,
    type GroupInfo,
    type SimpleUserInfo,
    type UserInfo
  } from '$lib/client';
  import { Skeleton } from '@profidev/pleiades/components/ui/skeleton';

  const { data } = $props();

  let deleteOpen = $state(false);
  let isLoading = $state(false);
  let user: UserInfo | undefined = $state();
  let adminGroup: string | undefined = $state();
  let group: GroupInfo | undefined = $state();
  let form: BaseForm<typeof groupSettings> | undefined = $state();
  let users: SimpleUserInfo[] | undefined = $state();

  let readonly = $derived(!user?.permissions.includes(Permission.GROUP_EDIT));

  $effect(() => {
    data.groupRes.then((res) => {
      if (!res.data) {
        if (res.response?.status === 404) {
          goto('/groups?error=not_found');
        } else {
          goto('/groups?error=other');
        }
        return;
      }

      group = res.data.group;
      adminGroup = res.data.admin_group;
      form?.setValue(formatData(group));
    });
  });

  $effect(() => {
    data.user.then((d) => {
      user = d;
    });
  });

  $effect(() => {
    data.usersPromise.then(({ data }) => {
      users = data;
    });
  });

  const deleteItemConfirm = async () => {
    if (!group) return;
    isLoading = true;
    let ret = await deleteGroup({ body: { uuid: group.id } });
    isLoading = false;

    if (ret.error) {
      return { error: 'Failed to delete group' };
    } else {
      toast.success(`Group ${group.name} deleted successfully`);
      setTimeout(() => {
        goto('/groups');
      });
    }
  };

  const onsubmit = async (form: FormValue<typeof groupSettings>) => {
    if (!group) return;
    let groupData = reformatData(form, group.id);
    if (group.id === adminGroup) {
      groupData.permissions = group.permissions;
    }
    let res = await editGroup({ body: groupData });

    if (res.error) {
      if (res.response?.status === 409) {
        return {
          error: 'This group name is already in use',
          field: 'name'
        } as const;
      } else if (res.response?.status === 406) {
        return {
          error: 'Admin group must have at least 1 user',
          field: 'users'
        } as const;
      } else {
        return { error: 'Failed to update group' };
      }
    } else {
      toast.success(`Group ${group.name} updated successfully`);
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
    <h3 class="flex text-xl font-medium">
      Group:
      {#if !group}
        <Skeleton class="ml-2 h-7 w-20" />
      {:else}
        {group.name}
      {/if}
    </h3>
    <Button
      class="ml-auto cursor-pointer"
      onclick={() => (deleteOpen = true)}
      variant="destructive"
      disabled={readonly || group?.id === adminGroup}
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
      bind:this={form}
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
                disabled={readonly}
              />
              <FormSelect
                {...props}
                key="users"
                label="Group Members"
                data={users?.map((user) => ({
                  label: user.name,
                  value: user.id
                })) || []}
              />
              {#if group?.id !== adminGroup}
                <Permissions
                  {user}
                  readonly={readonly || adminGroup === group?.id}
                  {...props}
                />
              {/if}
            </div>
          </div>
        </ScrollArea>
      {/snippet}
      {#snippet footer({
        isLoading,
        isError
      }: {
        isLoading: boolean;
        isError: boolean;
      })}
        <div class="mt-4 grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
          <Button
            class="ml-auto cursor-pointer"
            type="submit"
            disabled={isLoading}
            variant={isError ? 'destructive' : undefined}
          >
            {#if isLoading}
              <Spinner />
            {:else if isError}
              <RotateCcw />
            {:else}
              <Save />
            {/if}
            {isError ? 'Retry' : 'Save Changes'}</Button
          >
        </div>
      {/snippet}
    </BaseForm>
  </div>
</div>
<FormDialog
  title={`Delete Group`}
  description={`Do you really want to delete the group ${group?.name}?`}
  confirm="Delete"
  confirmVariant="destructive"
  onsubmit={deleteItemConfirm}
  bind:open={deleteOpen}
  bind:isLoading
  schema={z.object({})}
/>
