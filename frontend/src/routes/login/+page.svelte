<script lang="ts">
  import BaseForm from 'positron-components/components/form/base-form.svelte';
  import FormInput from 'positron-components/components/form/form-input.svelte';
  import { Button } from 'positron-components/components/ui/button';
  import * as Card from 'positron-components/components/ui/card';
  import { FieldSeparator } from 'positron-components/components/ui/field';
  import { login } from './schema.svelte';
  import type { FormValue } from 'positron-components/components/form/types';
  import { goto, invalidate } from '$app/navigation';
  import { connectWebsocket } from '$lib/backend/updater.svelte';
  import { toast } from 'positron-components/components/util/general';
  import FormInputPassword from 'positron-components/components/form/form-input-password.svelte';
  import { authenticate, SsoType } from '$lib/client';
  import { getEncrypt } from '$lib/backend/auth.svelte';

  let { data } = $props();

  $effect(() => {
    const url = new URL(window.location.href);
    let updated = false;
    if (data.error) {
      let error = '';
      switch (data.error) {
        case 'missing_code':
          error = 'SSO login failed: Missing authorization code.';
          break;
        case 'oidc_not_configured':
          error = 'SSO login failed: OIDC is not configured.';
          break;
        case 'user_not_found':
          error = 'User not found.';
          break;
        default:
          error = `SSO login failed: ${data.error}`;
      }

      toast.error(error);

      url.searchParams.delete('error');
      updated = true;
    }
    if (data.skip) {
      url.searchParams.delete('skip');
      updated = true;
    }
    if (updated) {
      window.history.replaceState({}, '', url);
    }
  });

  const onsubmit = async (data: FormValue<typeof login>) => {
    let encrypt = getEncrypt();
    if (!encrypt) {
      return {
        error: 'Encryption function not available. Please try again later.'
      };
    }

    let ret = await authenticate({
      body: {
        email: data.email,
        password: encrypt.encrypt(data.password) || ''
      }
    });

    if (!ret.data && ret.response.status === 401) {
      return { error: 'Invalid email or password.' };
    } else if (!ret.data && ret.response.status === 429) {
      return { error: 'Rate limit exceeded. Please try again later.' };
    } else if (!ret.data) {
      return { error: 'Login failed. Please try again.' };
    } else {
      setTimeout(() => {
        connectWebsocket((ret.data as { user: string }).user);
        invalidate('/api/user/info');
        goto('/');
      });
    }
  };
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
  <Card.Root class="mx-auto w-full max-w-sm">
    <Card.Header>
      <Card.Title class="text-2xl">Login</Card.Title>
      <Card.Description
        >Enter your login details below to login</Card.Description
      >
    </Card.Header>
    <Card.Content>
      <BaseForm schema={login} {onsubmit}>
        {#snippet children({ props })}
          <FormInput
            {...props}
            label="Email"
            type="email"
            placeholder="mail@example.com"
            key="email"
          />
          <FormInputPassword
            {...props}
            label="Password"
            placeholder="Your password"
            key="password"
          >
            {#if data.config?.mail_enabled}
              <a
                href="/password/forgot"
                class="ms-auto inline-block text-sm underline"
              >
                Forgot your password?
              </a>
            {/if}
          </FormInputPassword>
        {/snippet}
        {#snippet footer({ defaultBtn })}
          {@render defaultBtn({ content: 'Login' })}
        {/snippet}
      </BaseForm>
      {#if data.config?.sso_type !== SsoType.NONE}
        <FieldSeparator
          class="*:data-[slot=field-separator-content]:bg-card my-4"
          >Or continue with</FieldSeparator
        >
        <Button
          variant="outline"
          class="w-full cursor-pointer"
          onclick={() => {
            if (!data.oidc_url) {
              toast.error('Failed to get OIDC URL.');
              return;
            }
            window.location.href = data.oidc_url;
          }}>OIDC Provider</Button
        >
      {/if}
    </Card.Content>
  </Card.Root>
</div>
