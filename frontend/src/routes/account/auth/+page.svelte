<script lang="ts">
  import BaseForm from '@profidev/pleiades/components/form/base-form.svelte';
  import { authSettings } from './schema.svelte';
  import type { FormValue } from '@profidev/pleiades/components/form/types';
  import { Button } from '@profidev/pleiades/components/ui/button';
  import { Spinner } from '@profidev/pleiades/components/ui/spinner';
  import Save from '@lucide/svelte/icons/save';
  import { toast } from '@profidev/pleiades/components/util/general';
  import FormInputPassword from '@profidev/pleiades/components/form/form-input-password.svelte';
  import { updatePassword } from '$lib/client';
  import { getEncrypt } from '$lib/backend/auth.svelte';

  const onsubmit = async (form: FormValue<typeof authSettings>) => {
    let encrypt = getEncrypt();
    if (!encrypt) {
      return {
        error: 'Encryption function not available.'
      };
    }

    let ret = await updatePassword({
      body: {
        old_password: encrypt.encrypt(form.old_password || '') || '',
        new_password: encrypt.encrypt(form.new_password || '') || ''
      }
    });

    if (ret.error) {
      if (ret.response.status === 403) {
        return { error: 'Old password is incorrect', field: 'old_password' };
      } else if (ret.response.status === 429) {
        return { error: 'Rate limit exceeded. Please try again later.' };
      } else {
        return { error: 'An unknown error occurred' };
      }
    } else {
      toast.success('Password updated successfully');
    }
    // do not trigger form reset
    return { error: '' };
  };
</script>

<h4 class="mb-2">Authentication</h4>
<BaseForm schema={authSettings} {onsubmit}>
  {#snippet children({ props })}
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div class="flex flex-col gap-1">
        <FormInputPassword
          {...props}
          label="Old Password"
          key="old_password"
          placeholder="Enter your old password"
        />
        <FormInputPassword
          {...props}
          label="New Password"
          key="new_password"
          placeholder="Enter your new password"
        />
        <FormInputPassword
          {...props}
          label="Confirm New Password"
          key="new_password_confirm"
          placeholder="Enter your new password again"
        />
      </div>
    </div>
  {/snippet}
  {#snippet footer({ isLoading }: { isLoading: boolean })}
    <div class="mt-4 grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
      <Button class="ml-auto cursor-pointer" type="submit" disabled={isLoading}>
        {#if isLoading}
          <Spinner />
        {:else}
          <Save />
        {/if}
        Update Password</Button
      >
    </div>
  {/snippet}
</BaseForm>
