<script lang="ts">
  import BaseForm from '@profidev/pleiades/components/form/base-form.svelte';
  import { reformat, unReformat, userSettings } from './schema.svelte';
  import type { FormValue } from '@profidev/pleiades/components/form/types';
  import { Button } from '@profidev/pleiades/components/ui/button';
  import { Spinner } from '@profidev/pleiades/components/ui/spinner';
  import Save from '@lucide/svelte/icons/save';
  import { toast } from '@profidev/pleiades/components/util/general';
  import FormInputTooltip from '@profidev/pleiades/components/form/form-input-tooltip.svelte';
  import FormSwitch from '@profidev/pleiades/components/form/form-switch.svelte';
  import FormInput from '@profidev/pleiades/components/form/form-input.svelte';
  import { Label } from '@profidev/pleiades/components/ui/label';
  import FormInputPassword from '@profidev/pleiades/components/form/form-input-password.svelte';
  import { CopyButton } from '@profidev/pleiades/components/ui-extra/copy-button';
  import { Permission } from '$lib/permissions.svelte';
  import { Separator } from '@profidev/pleiades/components/ui/separator';
  import {
    saveUserSettings,
    type GeneralSettings,
    type UserInfo,
    type UserSettingsResponse
  } from '$lib/client';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

  let { data } = $props();

  let settings: UserSettingsResponse | undefined = $state();
  let generalSettings: GeneralSettings | undefined = $state();
  let user: UserInfo | undefined = $state();
  let isLoading = $state(false);
  let form: BaseForm<typeof userSettings> | undefined = $state();

  let readonly = $derived(
    !user?.permissions.includes(Permission.SETTINGS_EDIT)
  );

  $effect(() => {
    data.user.then((userInfo) => {
      user = userInfo;
    });
  });

  $effect(() => {
    data.generalSettingsPromise.then((generalSettingsInfo) => {
      generalSettings = generalSettingsInfo;
    });
  });

  $effect(() => {
    data.settingsPromise.then((settingsInfo) => {
      settings = settingsInfo;
      form?.setValue(
        unReformat(
          settings?.settings ?? {
            sso_create_user: true,
            sso_instant_redirect: true
          }
        )
      );
    });
  });

  const onsubmit = async (form: FormValue<typeof userSettings>) => {
    if (!settings) return;
    let data = reformat(form, settings.from_env);
    let ret = await saveUserSettings({ body: data });

    if (ret.error) {
      if (ret.response?.status === 406) {
        return {
          field: 'oidc_issuer',
          error:
            'Invalid OIDC configuration URL. Check the server logs for more information.'
        } as const;
      }
      toast.error('Failed to save user settings');
    } else {
      toast.success('User settings saved successfully');
    }
    // do not trigger form reset
    return { error: '' };
  };
</script>

<h4 class="mb-2">User Settings</h4>
<BaseForm schema={userSettings} {onsubmit} bind:this={form} bind:isLoading>
  {#snippet children({ props })}
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto_1fr]">
      <div class="flex flex-col gap-1">
        <FormSwitch
          {...props}
          key="oidc_enabled"
          label="Enable SSO via OpenID Connect"
          disabled={readonly || settings?.from_env.includes('oidc_enabled')}
        />
        <FormInputTooltip
          {...props}
          label="OpenID Connect Config URL"
          key="oidc_issuer"
          tooltip="The URL where the OpenID Connect configuration can be found. Without .well-known/openid-configuration at the end."
          placeholder="https://accounts.example.com"
          disabled={readonly || settings?.from_env.includes('oidc_issuer')}
        />
        <FormInput
          {...props}
          label="OpenID Connect Client ID"
          key="oidc_client_id"
          placeholder="your-client-id"
          disabled={readonly || settings?.from_env.includes('oidc_client_id')}
        />
        <FormInputPassword
          {...props}
          label="OpenID Connect Client Secret"
          key="oidc_client_secret"
          placeholder="your-client-secret"
          disabled={readonly ||
            settings?.from_env.includes('oidc_client_secret')}
        />
        <FormInput
          {...props}
          label="OpenID Connect Scopes (space separated)"
          key="oidc_scopes"
          placeholder="openid profile email"
          disabled={readonly || settings?.from_env.includes('oidc_scopes')}
        />
        <FormSwitch
          {...props}
          key="oidc_pkce"
          label="Use PKCE"
          disabled={readonly || settings?.from_env.includes('oidc_pkce')}
        />
        <FormSwitch
          {...props}
          key="oidc_image_sync"
          label="Sync profile images"
          disabled={readonly || settings?.from_env.includes('oidc_image_sync')}
        />
        <FormSwitch
          {...props}
          key="oidc_group_sync"
          label="Sync groups"
          disabled={readonly || settings?.from_env.includes('oidc_group_sync')}
        />
        <FormInput
          {...props}
          label="Claim for group sync (optional)"
          key="oidc_group_claim"
          placeholder="groups"
          disabled={readonly || settings?.from_env.includes('oidc_group_claim')}
        />
        <Label for="callback-url">Callback URL</Label>
        <CopyButton
          class="my-2 max-h-8 grow justify-start"
          id="callback-url"
          text={`${generalSettings?.site_url}api/auth/oidc/callback`}
          variant="outline"
        >
          <span class="truncate"
            >{`${generalSettings?.site_url}api/auth/oidc/callback`}</span
          >
        </CopyButton>
      </div>
      <Separator orientation="vertical" class="hidden lg:block" />
      <div class="flex flex-col gap-1">
        <FormSwitch
          {...props}
          key="sso_create_user"
          label="Create missing users on SSO login"
          disabled={readonly || settings?.from_env.includes('sso_create_user')}
        />
        <FormSwitch
          {...props}
          key="sso_instant_redirect"
          label="Instantly redirect to SSO provider when accessing the login page"
          disabled={readonly ||
            settings?.from_env.includes('sso_instant_redirect')}
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
    {#if (settings?.from_env.length ?? 0) > 0}
      <div class="mb-2 flex items-center">
        <TriangleAlert class="size-6 min-h-6 min-w-6 text-yellow-600" />
        <p class="ml-2 text-yellow-600">
          Values loaded from environment variables cannot be edited here.
        </p>
      </div>
    {/if}
    <div class="mt-4 flex">
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
