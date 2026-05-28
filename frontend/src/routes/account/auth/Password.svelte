<script lang="ts">
  import FormDialog from '@profidev/pleiades/components/form/form-dialog.svelte';
  import { toast } from '@profidev/pleiades/components/util/general';
  import { passwordChange } from './schema.svelte';
  import type { FormValue } from '@profidev/pleiades/components/form/types';
  import { getEncrypt } from '$lib/backend/auth.svelte';
  import { updatePassword } from '$lib/client';
  import FormInputPassword from '@profidev/pleiades/components/form/form-input-password.svelte';
  import * as Tooltip from '@profidev/pleiades/components/ui/tooltip';
  import { Button } from '@profidev/pleiades/components/ui/button';

  interface Props {
    oidc: boolean;
  }

  const { oidc }: Props = $props();

  let formOpen = $state(false);

  const changeConfirm = async (form: FormValue<typeof passwordChange>) => {
    if (form.password !== form.password_confirm) {
      return {
        error: 'Passwords are not equal',
        field: 'password_confirm'
      } as const;
    }

    let encrypt = getEncrypt();
    if (!encrypt) {
      return {
        error: 'Encryption function not available.'
      };
    }

    let { response } = await updatePassword({
      body: {
        old_password: encrypt.encrypt(form.old_password || '') || '',
        new_password: encrypt.encrypt(form.password || '') || ''
      }
    });

    if (response?.status !== 200) {
      if (response?.status === 401) {
        return {
          error: 'Passwords are not equal',
          field: 'password_confirm'
        } as const;
      } else {
        return { error: 'Error while updating password' };
      }
    } else {
      toast.success('Update successful', {
        description: 'Password was changed successfully'
      });
    }
  };
</script>

<div class="flex items-center">
  <h5>Password:</h5>
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger class="ml-auto">
        <Button
          variant="secondary"
          class="cursor-pointer"
          disabled={oidc}
          onclick={() => {
            formOpen = true;
          }}
        >
          Change Password
        </Button>
      </Tooltip.Trigger>
      {#if oidc}
        <Tooltip.Content side="left">
          <p>
            Oidc users can not change their password. Please contact your
            administrator to change your password.
          </p>
        </Tooltip.Content>
      {/if}
    </Tooltip.Root>
  </Tooltip.Provider>
  <FormDialog
    title="Change Password"
    description="Enter your new password below"
    confirm="Change Password"
    onsubmit={changeConfirm}
    schema={passwordChange}
    bind:open={formOpen}
  >
    {#snippet children({ props })}
      <FormInputPassword
        {...props}
        label="Old Password"
        key="old_password"
        placeholder="Old Password"
      />
      <FormInputPassword
        {...props}
        label="New Password"
        key="password"
        placeholder="New Password"
      />
      <FormInputPassword
        {...props}
        label="Confirm New Password"
        key="password_confirm"
        placeholder="Confirm New Password"
      />
    {/snippet}
  </FormDialog>
</div>
