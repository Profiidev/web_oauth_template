<script lang="ts">
  import type { StageProps } from '@profidev/pleiades/components/form/types';
  import type { SvelteComponent } from 'svelte';
  import * as Tabs from '@profidev/pleiades/components/ui/tabs';
  import AdminUser from './AdminUser.svelte';
  import OidcSetup from './OidcSetup.svelte';

  let {
    initialValue,
    onsubmit: outerOnSubmit,
    footer,
    isLoading,
    data
  }: StageProps<{
    db_backend: string;
    from_env: string[];
    site_url: string;
    configured: boolean;
  }> = $props();

  let admin: SvelteComponent | undefined = $state();
  let oidc: SvelteComponent | undefined = $state();
  // svelte-ignore state_referenced_locally
  let tab = $state(data.configured ? 'oidc' : 'user');

  export const getValue = () => {
    let adminValue = admin?.getValue() || {};
    let oidcValue = oidc?.getValue() || {};
    return {
      ...adminValue,
      ...oidcValue,
      oidc: tab === 'oidc'
    };
  };

  const onsubmit = async (formData: object) => {
    return await outerOnSubmit({
      ...formData,
      oidc: tab === 'oidc'
    });
  };
</script>

<Tabs.Root class="w-full" bind:value={tab}>
  <Tabs.List class="grid w-full grid-cols-2">
    <Tabs.Trigger value="user">Admin User</Tabs.Trigger>
    <Tabs.Trigger value="oidc">OpenID Connect</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="user">
    <AdminUser
      {initialValue}
      {onsubmit}
      {footer}
      {isLoading}
      {data}
      bind:this={admin}
    />
  </Tabs.Content>
  <Tabs.Content value="oidc">
    <OidcSetup
      {initialValue}
      {onsubmit}
      {footer}
      {isLoading}
      {data}
      bind:this={oidc}
    />
  </Tabs.Content>
</Tabs.Root>
