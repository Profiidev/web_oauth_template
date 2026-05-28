<script lang="ts">
  import type { StageProps } from '@profidev/pleiades/components/form/types';
  import BaseForm from '@profidev/pleiades/components/form/base-form.svelte';
  import FormInput from '@profidev/pleiades/components/form/form-input.svelte';
  import FormInputPassword from '@profidev/pleiades/components/form/form-input-password.svelte';
  import { userSettings } from '../settings/user/schema.svelte';
  import FormSwitch from '@profidev/pleiades/components/form/form-switch.svelte';
  import FormInputTooltip from '@profidev/pleiades/components/form/form-input-tooltip.svelte';
  import { Label } from '@profidev/pleiades/components/ui/label';
  import { CopyButton } from '@profidev/pleiades/components/ui-extra/copy-button';

  let {
    initialValue,
    onsubmit,
    footer,
    isLoading,
    data
  }: StageProps<{
    db_backend: string;
    from_env: string[];
    site_url: string;
  }> = $props();

  let form: BaseForm<typeof userSettings> | undefined = $state();

  export const getValue = () => {
    return form?.getValue();
  };
</script>

<BaseForm
  {onsubmit}
  {initialValue}
  {footer}
  bind:isLoading
  schema={userSettings}
  bind:this={form}
>
  {#snippet children({ props })}
    <FormInputTooltip
      {...props}
      label="OpenID Connect Config URL"
      key="oidc_issuer"
      tooltip="The URL where the OpenID Connect configuration can be found. Without .well-known/openid-configuration at the end."
      placeholder="https://accounts.example.com"
      disabled={data?.from_env.includes('oidc_issuer')}
    />
    <FormInput
      {...props}
      label="OpenID Connect Client ID"
      key="oidc_client_id"
      placeholder="your-client-id"
      disabled={data?.from_env.includes('oidc_client_id')}
    />
    <FormInputPassword
      {...props}
      label="OpenID Connect Client Secret"
      key="oidc_client_secret"
      placeholder="your-client-secret"
      disabled={data?.from_env.includes('oidc_client_secret')}
    />
    <FormInput
      {...props}
      label="OpenID Connect Scopes (space separated)"
      key="oidc_scopes"
      placeholder="openid profile email"
      disabled={data?.from_env.includes('oidc_scopes')}
    />
    <FormSwitch
      {...props}
      key="oidc_image_sync"
      label="Sync profile images"
      disabled={data?.from_env.includes('oidc_image_sync')}
    />
    <FormSwitch
      {...props}
      key="oidc_group_sync"
      label="Sync groups"
      disabled={data?.from_env.includes('oidc_group_sync')}
    />
    <FormInput
      {...props}
      label="Claim for group sync (optional)"
      key="oidc_group_claim"
      placeholder="groups"
      disabled={data?.from_env.includes('oidc_group_claim')}
    />
    <Label for="callback-url">Callback URL</Label>
    <CopyButton
      class="my-2 max-h-8 grow justify-start"
      id="callback-url"
      text={`${data?.site_url}api/auth/oidc/callback`}
      variant="outline"
    >
      <span class="truncate">{`${data?.site_url}api/auth/oidc/callback`}</span>
    </CopyButton>
  {/snippet}
</BaseForm>
