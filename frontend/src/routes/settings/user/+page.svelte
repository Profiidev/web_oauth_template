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
  import { Input } from '@profidev/pleiades/components/ui/input';
  import FormInputPassword from '@profidev/pleiades/components/form/form-input-password.svelte';
  import { Permission } from '$lib/permissions.svelte';
  import { Separator } from '@profidev/pleiades/components/ui/separator';
  import { saveUserSettings } from '$lib/client';

  let { data } = $props();

  // svelte-ignore state_referenced_locally
  let oidcEnabled = $state(!!data.settings?.oidc);
  $effect(() => {
    oidcEnabled = !!data.settings?.oidc;
  });
  let readonly = $derived(
    !data.user?.permissions.includes(Permission.SETTINGS_EDIT)
  );

  const onsubmit = async (form: FormValue<typeof userSettings>) => {
    let data = reformat(form);
    let ret = await saveUserSettings({ body: data });

    if (ret.error) {
      if (ret.response.status === 406) {
        return {
          field: 'oidc_issuer',
          error:
            'Invalid OIDC configuration URL. Check the server logs for more information.'
        };
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
<BaseForm
  schema={userSettings}
  {onsubmit}
  initialValue={unReformat(
    data.settings ?? {
      sso_create_user: true,
      sso_instant_redirect: true
    }
  )}
>
  {#snippet children({ props })}
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr]">
      <div class="flex flex-col gap-1">
        <FormSwitch
          {...props}
          key="oidc_enabled"
          label="Enable SSO via OpenID Connect"
          onCheckedChange={(v) => (oidcEnabled = v)}
          disabled={readonly}
        />
        {#if oidcEnabled}
          <FormInputTooltip
            {...props}
            label="OpenID Connect Config URL"
            key="oidc_issuer"
            tooltip="The URL where the OpenID Connect configuration can be found. Without .well-known/openid-configuration at the end."
            placeholder="https://accounts.example.com"
            {readonly}
          />
          <FormInput
            {...props}
            label="OpenID Connect Client ID"
            key="oidc_client_id"
            placeholder="your-client-id"
            {readonly}
          />
          <FormInputPassword
            {...props}
            label="OpenID Connect Client Secret"
            key="oidc_client_secret"
            placeholder="your-client-secret"
            {readonly}
          />
          <FormInput
            {...props}
            label="OpenID Connect Scopes (space separated)"
            key="oidc_scopes"
            placeholder="openid profile email"
            {readonly}
          />
          <Label for="callback-url">Callback URL</Label>
          <Input
            id="callback-url"
            value={`${data.generalSettings?.site_url}api/auth/oidc/callback`}
            readonly
            class="mt-2"
          />
        {/if}
      </div>
      <Separator orientation="vertical" class="hidden lg:block" />
      <div class="flex flex-col gap-1">
        <FormSwitch
          {...props}
          key="sso_create_user"
          label="Create missing users on SSO login"
          disabled={readonly}
        />
        <FormSwitch
          {...props}
          key="sso_instant_redirect"
          label="Instantly redirect to SSO provider when accessing the login page"
          disabled={readonly}
        />
      </div>
    </div>
  {/snippet}
  {#snippet footer({ isLoading }: { isLoading: boolean })}
    <Button class="ml-auto cursor-pointer" type="submit" disabled={isLoading}>
      {#if isLoading}
        <Spinner />
      {:else}
        <Save />
      {/if}
      Save Changes</Button
    >
  {/snippet}
</BaseForm>
