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
  import {
    formatData,
    userSettings,
    reformatData,
    resetPassword
  } from './schema.svelte.js';
  import type { FormValue } from 'positron-components/components/form/types';
  import FormInput from 'positron-components/components/form/form-input.svelte';
  import Save from '@lucide/svelte/icons/save';
  import { Spinner } from 'positron-components/components/ui/spinner';
  import FormSelect from 'positron-components/components/form/form-select.svelte';
  import SimpleAvatar from 'positron-components/components/util/simple-avatar.svelte';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import FormInputPassword from 'positron-components/components/form/form-input-password.svelte';
  import {
    deleteUser,
    editUser,
    resetUserAvatar,
    resetUserPassword
  } from '$lib/client';
  import { getEncrypt } from '$lib/backend/auth.svelte.js';

  const { data } = $props();

  let resetOpen = $state(false);
  let deleteOpen = $state(false);
  let isLoading = $state(false);
  let readonly = $derived(
    !data.user?.permissions.includes(Permission.USER_EDIT)
  );
  let allowSpecialEdit = $derived(
    data.userInfo.permissions.every((perm) =>
      data.user?.permissions.includes(perm)
    )
  );

  const deleteItemConfirm = async () => {
    isLoading = true;
    let ret = await deleteUser({
      body: {
        uuid: data.userInfo.uuid
      }
    });
    isLoading = false;

    if (ret.error) {
      if (ret.response.status === 409) {
        return { error: 'Cannot delete the last user from the admin group' };
      } else if (ret.response.status === 403) {
        return { error: 'You do not have permission to delete this user' };
      } else {
        return { error: 'Failed to delete user' };
      }
    } else {
      toast.success(`User ${data.userInfo.name} deleted successfully`);
      setTimeout(() => {
        goto('/users');
      });
    }
  };

  const onsubmit = async (form: FormValue<typeof userSettings>) => {
    let user = reformatData(form, data.userInfo.uuid);
    let res = await editUser({
      body: user
    });

    if (res.error) {
      if (res.response.status === 409) {
        return { error: 'Cannot remove the last user from the admin group' };
      } else if (res.response.status === 403) {
        return { error: 'Cannot assign permissions that you do not have' };
      } else {
        return { error: 'Failed to update user' };
      }
    } else {
      toast.success(`User ${data.userInfo.name} updated successfully`);
      // do not trigger form reset
      return { error: '' };
    }
  };

  const resetPasswordSubmit = async (form: FormValue<typeof resetPassword>) => {
    let encrypt = getEncrypt();
    if (!encrypt) {
      return { error: 'Encryption function not available' };
    }

    let res = await resetUserPassword({
      body: {
        uuid: data.userInfo.uuid,
        new_password: encrypt.encrypt(form.new_password) || ''
      }
    });

    if (res.error) {
      if (res.response.status === 403) {
        return { error: 'You do not have permission to reset this password' };
      } else {
        return { error: 'Failed to reset password' };
      }
    } else {
      toast.success(
        `Password for user ${data.userInfo.name} reset successfully`
      );
    }
  };
</script>

<div class="flex h-full w-full flex-col space-y-6 p-4">
  <div class="mt-1! mb-0 ml-7 flex items-center md:m-0">
    <Button size="icon" variant="ghost" href="/users" class="mr-2">
      <ArrowLeft class="size-5" />
    </Button>
    <h3 class="text-xl font-medium">User: {data.userInfo.name}</h3>
    {#if !data.mailActive && allowSpecialEdit}
      <Button
        variant="secondary"
        class="mr-2 ml-auto cursor-pointer"
        onclick={() => (resetOpen = true)}
        disabled={readonly}
      >
        <RotateCcw />
        Reset Password
      </Button>
    {/if}
    <Button
      class={'cursor-pointer' +
        (data.mailActive || !allowSpecialEdit ? ' ml-auto' : '')}
      onclick={() => (deleteOpen = true)}
      variant="destructive"
      disabled={readonly}
    >
      <Trash />
      Delete
    </Button>
  </div>
  <Separator class="my-4" />
  <div
    class="flex grow flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-6"
  >
    <div class="flex-1">
      <h4 class="mb-2">Settings</h4>
      <BaseForm
        schema={userSettings}
        {onsubmit}
        initialValue={formatData(data.userInfo)}
      >
        {#snippet children({ props })}
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <div>
              <div class="mb-2 flex items-center">
                <SimpleAvatar
                  src={data.userInfo.avatar ?? ''}
                  class="size-14"
                />
                <Button
                  variant="secondary"
                  class="ml-auto cursor-pointer"
                  disabled={readonly}
                  onclick={async () => {
                    if (
                      (
                        await resetUserAvatar({
                          body: { uuid: data.userInfo.uuid }
                        })
                      ).error
                    ) {
                      toast.error('Failed to reset avatar');
                    } else {
                      toast.success('Avatar reset successfully');
                    }
                  }}
                >
                  <RotateCcw />
                  Reset Avatar</Button
                >
              </div>
              <FormInput
                {...props}
                key="name"
                label="User Name"
                placeholder="Enter user name"
                {readonly}
              />
              <FormSelect
                {...props}
                key="groups"
                label="Group Membership"
                disabled={readonly || !allowSpecialEdit}
                data={data.groups?.map((group) => ({
                  label: group.name,
                  value: group.uuid
                })) || []}
              />
            </div>
          </div>
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
</div>
<FormDialog
  title={`Delete User`}
  description={`Do you really want to delete the user ${data.userInfo.name}?`}
  confirm="Delete"
  confirmVariant="destructive"
  onsubmit={deleteItemConfirm}
  bind:open={deleteOpen}
  bind:isLoading
  schema={z.object({})}
/>
<FormDialog
  title={`Reset Password`}
  description={`Do you really want to reset the password for user ${data.userInfo.name}?`}
  confirm="Reset"
  onsubmit={resetPasswordSubmit}
  bind:open={resetOpen}
  bind:isLoading
  schema={resetPassword}
>
  {#snippet children({ props })}
    <FormInputPassword
      {...props}
      key="new_password"
      label="New Password"
      placeholder="Enter new password"
    />
  {/snippet}
</FormDialog>
