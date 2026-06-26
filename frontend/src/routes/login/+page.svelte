<script lang="ts">
  import BaseForm from '@profidev/pleiades/components/form/base-form.svelte';
  import FormInput from '@profidev/pleiades/components/form/form-input.svelte';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import { Button } from '@profidev/pleiades/components/ui/button';
  import * as Card from '@profidev/pleiades/components/ui/card';
  import { FieldSeparator } from '@profidev/pleiades/components/ui/field';
  import { login } from './schema.svelte';
  import type { FormValue } from '@profidev/pleiades/components/form/types';
  import { goto, invalidate } from '$app/navigation';
  import { connectWebsocket } from '$lib/backend/updater.svelte';
  import { toast } from '@profidev/pleiades/components/util/general';
  import FormInputPassword from '@profidev/pleiades/components/form/form-input-password.svelte';
  import { getEncrypt, getOidcUrl } from '$lib/backend/auth.svelte';
  import { Spinner } from '@profidev/pleiades/components/ui/spinner';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import { authenticate, SsoType, type AuthConfig } from '$lib/client';
  import { OIDC_ERRORS } from '$lib/permissions.svelte';

  let { data } = $props();

  let isLoading = $state(false);
  let config: AuthConfig | undefined = $state();
  let oidcUrl: string | undefined = $state();
  let oidcError: boolean = $state(false);

  $effect(() => {
    const url = new URL(window.location.href);
    let updated = false;

    if (data.error) {
      let error: string = OIDC_ERRORS[data.error as keyof typeof OIDC_ERRORS];
      if (!error) {
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

  $effect(() => {
    data.config?.then(async (d) => {
      config = d;

      if (!oidcUrl) {
        oidcUrl = await getOidcUrl(data.redirectTo);
        if (config?.instant_redirect && oidcUrl && !data.skip) {
          window.location.href = oidcUrl;
        }
      }
    });
  });

  const loginSuccess = (user: string) => {
    setTimeout(async () => {
      connectWebsocket(user);
      await invalidate('/api/user/info');
      await goto(data.redirectTo);
    });
  };

  const onsubmit = async (formData: FormValue<typeof login>) => {
    let encrypt = getEncrypt();
    if (!encrypt) {
      return {
        error: 'Encryption function not available. Please try again later.'
      };
    }

    let ret = await authenticate({
      body: {
        email: formData.email,
        password: encrypt.encrypt(formData.password) || ''
      },
      parseAs: 'json'
    });

    if (!ret.data && ret.response?.status === 401) {
      return {
        error: 'Invalid email or password.',
        field: 'password'
      } as const;
    } else if (!ret.data && ret.response?.status === 429) {
      return { error: 'Rate limit exceeded. Please try again later.' };
    } else if (!ret.data) {
      return { error: 'Login failed. Please try again.' };
    } else {
      loginSuccess((ret.data as { user: string }).user);
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
      <BaseForm schema={login} {onsubmit} bind:isLoading submitText="Login">
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
            {#if config?.mail_enabled}
              <a
                href="/password/forgot"
                class="ms-auto inline-block text-sm underline"
                tabindex="-1"
              >
                Forgot your password?
              </a>
            {/if}
          </FormInputPassword>
        {/snippet}
      </BaseForm>
      {#if config?.sso_type !== SsoType.NONE}
        <FieldSeparator
          class="*:data-[slot=field-separator-content]:bg-card my-4"
          >Or continue with</FieldSeparator
        >
        <Button
          class="w-full cursor-pointer"
          variant={oidcError ? 'destructive' : 'outline'}
          onclick={async () => {
            if (oidcError) {
              isLoading = true;
              oidcError = false;
              oidcUrl = await getOidcUrl(data.redirectTo);
              isLoading = false;
            }

            if (!oidcUrl) {
              toast.error('Failed to get OIDC URL.');
              oidcError = true;
              return;
            }
            window.location.href = oidcUrl;
          }}
        >
          {#if isLoading}
            <Spinner />
          {:else if oidcError}
            <RotateCcw />
          {:else}
            <KeyRound />
          {/if}
          {oidcError ? 'Retry OIDC' : 'OIDC Provider'}</Button
        >
      {/if}
    </Card.Content>
  </Card.Root>
</div>
