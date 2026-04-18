<script lang="ts">
  import BaseForm from '@profidev/pleiades/components/form/base-form.svelte';
  import FormInput from '@profidev/pleiades/components/form/form-input.svelte';
  import * as Card from '@profidev/pleiades/components/ui/card';
  import { resetPassword } from './schema.svelte';
  import type { FormValue } from '@profidev/pleiades/components/form/types';
  import { toast } from '@profidev/pleiades/components/util/general';
  import FormInputPassword from '@profidev/pleiades/components/form/form-input-password.svelte';
  import { goto } from '$app/navigation';
  import { resetPassword as sendResetPassword } from '$lib/client';
  import { getEncrypt } from '$lib/backend/auth.svelte';

  let { data } = $props();

  const onsubmit = async (data: FormValue<typeof resetPassword>) => {
    let encrypt = getEncrypt();
    if (!encrypt) {
      return {
        error: 'Encryption function not available. Please try again later.'
      };
    }

    let ret = await sendResetPassword({
      body: {
        token: data.token,
        new_password: encrypt.encrypt(data.new_password) || ''
      }
    });

    if (ret.error && ret.response.status === 429) {
      return { error: 'Rate limit exceeded. Please try again later.' };
    } else if (ret.error) {
      return { error: 'Failed to reset password.' };
    } else {
      toast.success(
        'Password has been reset successfully. You can now log in.'
      );
      setTimeout(() => {
        goto('/login');
      });
    }
  };
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
  <Card.Root class="mx-auto w-full max-w-sm">
    <Card.Header>
      <Card.Title class="text-2xl">Reset Password</Card.Title>
      <Card.Description
        >Enter your new password below to reset your password</Card.Description
      >
    </Card.Header>
    <Card.Content>
      <BaseForm
        schema={resetPassword}
        {onsubmit}
        initialValue={{ token: data.token ?? '' }}
      >
        {#snippet children({ props })}
          <FormInput
            {...props}
            label="Token"
            placeholder="Enter your token"
            key="token"
          />
          <FormInputPassword
            {...props}
            label="New Password"
            placeholder="Enter your new password"
            key="new_password"
          />
          <FormInputPassword
            {...props}
            label="Confirm Password"
            placeholder="Confirm your new password"
            key="confirm_password"
          />
        {/snippet}
        {#snippet footer({ defaultBtn })}
          {@render defaultBtn({ content: 'Reset Password' })}
        {/snippet}
      </BaseForm>
    </Card.Content>
  </Card.Root>
</div>
