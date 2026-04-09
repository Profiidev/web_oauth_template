<script lang="ts">
  import FormCheckbox from 'positron-components/components/form/form-checkbox.svelte';
  import { Permission } from '$lib/permissions.svelte';
  import type {
    FormValue,
    SuperForm
  } from 'positron-components/components/form/types';
  import type { groupSettings } from './schema.svelte';
  import type { UserInfo } from '$lib/client';

  interface Props {
    user?: UserInfo;
    readonly: boolean;
    disabled: boolean;
    formData: SuperForm<FormValue<typeof groupSettings>>;
  }

  const { user, readonly, ...props }: Props = $props();
</script>

<h5>Permissions</h5>
<div class="ml-4">
  {#if user?.permissions.includes(Permission.SETTINGS_VIEW) || user?.permissions.includes(Permission.SETTINGS_EDIT)}
    <h6>Settings</h6>
    <div class="ml-4">
      {#if user?.permissions.includes(Permission.SETTINGS_VIEW)}
        <FormCheckbox
          {...props}
          key="settings_view"
          label="View Settings"
          disabled={readonly}
        />
      {/if}
      {#if user?.permissions.includes(Permission.SETTINGS_EDIT)}
        <FormCheckbox
          {...props}
          key="settings_edit"
          label="Edit Settings"
          disabled={readonly}
        />
      {/if}
    </div>
  {/if}
  {#if user?.permissions.includes(Permission.GROUP_VIEW) || user?.permissions.includes(Permission.GROUP_EDIT)}
    <h6>Groups</h6>
    <div class="ml-4">
      {#if user?.permissions.includes(Permission.GROUP_VIEW)}
        <FormCheckbox
          {...props}
          key="group_view"
          label="View Groups"
          disabled={readonly}
        />
      {/if}
      {#if user?.permissions.includes(Permission.GROUP_EDIT)}
        <FormCheckbox
          {...props}
          key="group_edit"
          label="Edit Groups"
          disabled={readonly}
        />
      {/if}
    </div>
  {/if}
  {#if user?.permissions.includes(Permission.USER_VIEW) || user?.permissions.includes(Permission.USER_EDIT)}
    <h6>Users</h6>
    <div class="ml-4">
      {#if user?.permissions.includes(Permission.USER_VIEW)}
        <FormCheckbox
          {...props}
          key="user_view"
          label="View Users"
          disabled={readonly}
        />
      {/if}
      {#if user?.permissions.includes(Permission.USER_EDIT)}
        <FormCheckbox
          {...props}
          key="user_edit"
          label="Edit Users"
          disabled={readonly}
        />
      {/if}
    </div>
  {/if}
</div>
