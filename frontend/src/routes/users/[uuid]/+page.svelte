<script lang="ts">
  import { Separator } from '@profidev/pleiades/components/ui/separator';
  import { Button } from '@profidev/pleiades/components/ui/button';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import Trash from '@lucide/svelte/icons/trash';
  import { avatarUrl, Permission } from '$lib/permissions.svelte';
  import FormDialog from '@profidev/pleiades/components/form/form-dialog.svelte';
  import { z } from 'zod';
  import { toast } from '@profidev/pleiades/components/util/general';
  import { goto } from '$app/navigation';
  import BaseForm from '@profidev/pleiades/components/form/base-form.svelte';
  import {
    formatData,
    userSettings,
    reformatData,
    resetPassword,
    changeEmailSchema,
    convertUserSchema
  } from './schema.svelte.js';
  import type { FormValue } from '@profidev/pleiades/components/form/types';
  import FormInput from '@profidev/pleiades/components/form/form-input.svelte';
  import Save from '@lucide/svelte/icons/save';
  import { Spinner } from '@profidev/pleiades/components/ui/spinner';
  import FormSelect from '@profidev/pleiades/components/form/form-select.svelte';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import FormInputPassword from '@profidev/pleiades/components/form/form-input-password.svelte';
  import {
    changeUserEmail,
    convertOidcUser,
    deleteUser,
    editUser,
    resetUserAvatar,
    resetUserPassword,
    type DetailUserInfo,
    type SimpleGroupInfo
  } from '$lib/client';
  import { getEncrypt } from '$lib/backend/auth.svelte.js';
  import { Skeleton } from '@profidev/pleiades/components/ui/skeleton';
  import SimpleAvatar from '$lib/components/SimpleAvatar.svelte';
  import { Label } from '@profidev/pleiades/components/ui/label';
  import { Input } from '@profidev/pleiades/components/ui/input';

  const { data } = $props();

  let resetOpen = $state(false);
  let deleteOpen = $state(false);
  let emailOpen = $state(false);
  let convertOpen = $state(false);
  let isLoading = $state(false);
  let readonly = $state(true);
  let allowSpecialEdit = $state(false);
  let userInfo: DetailUserInfo | undefined = $state();
  let groups: SimpleGroupInfo[] = $state([]);
  let form: BaseForm<typeof userSettings> | undefined = $state();

  $effect(() => {
    Promise.all([data.user, data.userInfoPromise]).then(([user, res]) => {
      if (!res.data) {
        if (res.response?.status === 404) {
          goto('/users?error=not_found');
        } else {
          goto('/users?error=other');
        }
        return;
      }
      const detailUserInfo = res.data;

      userInfo = detailUserInfo;
      form?.setValue(formatData(detailUserInfo));
      readonly = !user.permissions.includes(Permission.USER_EDIT);
      allowSpecialEdit = detailUserInfo.permissions.every((perm) =>
        user.permissions.includes(perm)
      );
    });
  });

  $effect(() => {
    data.groupsPromise.then((res) => {
      groups = res;
    });
  });

  const deleteItemConfirm = async () => {
    if (!userInfo) return;
    isLoading = true;
    let ret = await deleteUser({
      body: {
        uuid: userInfo.uuid
      }
    });
    isLoading = false;

    if (ret.error) {
      if (ret.response?.status === 409) {
        return { error: 'Cannot delete the last user from the admin group' };
      } else if (ret.response?.status === 403) {
        return { error: 'You do not have permission to delete this user' };
      } else {
        return { error: 'Failed to delete user' };
      }
    } else {
      toast.success(`User ${userInfo.name} deleted successfully`);
      setTimeout(() => {
        goto('/users');
      });
    }
  };

  const onsubmit = async (form: FormValue<typeof userSettings>) => {
    if (!userInfo) return;
    let user = reformatData(form, userInfo.uuid);
    let res = await editUser({
      body: user
    });

    if (res.error) {
      if (res.response?.status === 409) {
        return {
          error: 'Cannot remove the last user from the admin group',
          field: 'groups'
        } as const;
      } else if (res.response?.status === 403) {
        return { error: 'Cannot assign permissions that you do not have' };
      } else {
        return { error: 'Failed to update user' };
      }
    } else {
      toast.success(`User ${userInfo.name} updated successfully`);
      // do not trigger form reset
      return { error: '' };
    }
  };

  const resetPasswordSubmit = async (form: FormValue<typeof resetPassword>) => {
    if (!userInfo) return;
    let encrypt = getEncrypt();
    if (!encrypt) {
      return { error: 'Encryption function not available' };
    }

    let res = await resetUserPassword({
      body: {
        uuid: userInfo.uuid,
        new_password: encrypt.encrypt(form.new_password) || ''
      }
    });

    if (res.error) {
      if (res.response?.status === 403) {
        return { error: 'You do not have permission to reset this password' };
      } else {
        return { error: 'Failed to reset password' };
      }
    } else {
      toast.success(`Password for user ${userInfo.name} reset successfully`);
    }
  };

  const convertUserSubmit = async (
    form: FormValue<typeof convertUserSchema>
  ) => {
    if (!userInfo) return;
    let encrypt = getEncrypt();
    if (!encrypt) {
      return { error: 'Encryption function not available' };
    }

    let res = await convertOidcUser({
      body: {
        uuid: userInfo.uuid,
        new_password: encrypt.encrypt(form.new_password) || ''
      }
    });

    if (res.error) {
      if (res.response?.status === 403) {
        return { error: 'You do not have permission to convert this user' };
      } else {
        return { error: 'Failed to convert user' };
      }
    } else {
      toast.success(
        `User ${userInfo.name} converted to local user successfully`
      );
    }
  };

  const changeEmailSubmit = async (
    form: FormValue<typeof changeEmailSchema>
  ) => {
    if (!userInfo) return;
    let res = await changeUserEmail({
      body: {
        uuid: userInfo.uuid,
        new_email: form.new_email
      }
    });

    if (res.error) {
      if (res.response?.status === 403) {
        return { error: 'You do not have permission to change this email' };
      } else if (res.response?.status === 409) {
        return { error: 'Email already in use', field: 'new_email' } as const;
      } else {
        return { error: 'Failed to change email' };
      }
    } else {
      toast.success(`Email for user ${userInfo.name} changed successfully`);
    }
  };
</script>

<div class="flex h-full w-full flex-col space-y-6 p-4">
  <div class="mt-1! mb-0 ml-7 flex items-center md:m-0">
    <Button size="icon" variant="ghost" href="/users" class="mr-2">
      <ArrowLeft class="size-5" />
    </Button>
    <h3 class="flex text-xl font-medium">
      User:
      {#if !userInfo}
        <Skeleton class="ml-2 h-7 w-20" />
      {:else}
        {userInfo.name}
      {/if}
    </h3>
    {#if allowSpecialEdit && !userInfo?.oidc_user}
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
    {#if allowSpecialEdit && userInfo?.oidc_user}
      <Button
        variant="secondary"
        class={'mr-2 cursor-pointer' +
          (!allowSpecialEdit || userInfo?.oidc_user ? ' ml-auto' : '')}
        onclick={() => (convertOpen = true)}
        disabled={readonly}
      >
        <RotateCcw />
        Convert to Local User
      </Button>
    {/if}
    <Button
      class={'cursor-pointer' +
        (!(allowSpecialEdit && !userInfo?.oidc_user) &&
        !(allowSpecialEdit && userInfo?.oidc_user)
          ? ' ml-auto'
          : '')}
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
      <BaseForm schema={userSettings} {onsubmit} bind:this={form}>
        {#snippet children({ props })}
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <div>
              <div class="mb-2 flex items-center">
                <SimpleAvatar
                  src={userInfo ? avatarUrl + `/${userInfo.uuid}` : ''}
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
                          body: { uuid: userInfo?.uuid || '' }
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
                disabled={readonly}
              />
              <Label>Email</Label>
              <div class="my-2 flex gap-2">
                <Input
                  class="grow"
                  placeholder="mail@example.com"
                  readonly
                  value={userInfo?.email}
                />
                {#if allowSpecialEdit && !userInfo?.oidc_user}
                  <Button
                    variant="secondary"
                    class="cursor-pointer"
                    onclick={() => (emailOpen = true)}
                    disabled={readonly}
                  >
                    <RotateCcw />
                    Change Email
                  </Button>
                {/if}
              </div>
              <FormSelect
                {...props}
                key="groups"
                label="Group Membership"
                disabled={readonly || !allowSpecialEdit}
                data={groups.map((group) => ({
                  label: group.name,
                  value: group.uuid
                }))}
              />
            </div>
          </div>
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
              disabled={isLoading || readonly}
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
</div>
<FormDialog
  title={`Delete User`}
  description={`Do you really want to delete the user ${userInfo?.name}?`}
  confirm="Delete"
  confirmVariant="destructive"
  onsubmit={deleteItemConfirm}
  bind:open={deleteOpen}
  bind:isLoading
  schema={z.object({})}
/>
<FormDialog
  title={`Reset Password`}
  description={`Do you really want to reset the password for user ${userInfo?.name}?`}
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
<FormDialog
  title={`Change Email`}
  description={`Do you really want to change the email for user ${userInfo?.name}?`}
  confirm="Change"
  onsubmit={changeEmailSubmit}
  bind:open={emailOpen}
  bind:isLoading
  schema={changeEmailSchema}
>
  {#snippet children({ props })}
    <FormInput
      {...props}
      key="new_email"
      label="New Email"
      placeholder="mail@example.com"
      type="email"
    />
  {/snippet}
</FormDialog>
<FormDialog
  title={`Convert to Local User`}
  description={`Do you really want to convert user ${userInfo?.name} to a local user? This will allow the user to change email and password for usage with the local login. Login with oidc is not affected. This action cannot be undone.`}
  confirm="Convert"
  onsubmit={convertUserSubmit}
  bind:open={convertOpen}
  bind:isLoading
  schema={convertUserSchema}
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
