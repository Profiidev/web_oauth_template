<script lang="ts">
  import FormCheckbox from '@profidev/pleiades/components/form/form-checkbox.svelte';
  import { Permission } from '$lib/permissions.svelte';
  import type {
    FormPath,
    FormValue,
    SuperForm
  } from '@profidev/pleiades/components/form/types';
  import type { groupSettings } from './schema.svelte';
  import type { UserInfo } from '$lib/client';
  import * as Collapsible from '@profidev/pleiades/components/ui/collapsible';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import ChevronUp from '@lucide/svelte/icons/chevron-up';

  interface Props {
    user?: UserInfo;
    readonly: boolean;
    disabled: boolean;
    formData: SuperForm<FormValue<typeof groupSettings>>;
  }

  const { user, readonly, ...props }: Props = $props();
</script>

<h5>Permissions</h5>
<div class="ml-3 grow">
  <Collapsible.Root class="my-1 w-full" open={true}>
    <Collapsible.Trigger>
      {#snippet child({ props })}
        <button {...props} class="flex w-full cursor-pointer">
          <span>Administration</span>
          {#if props['data-state'] === 'closed'}
            <ChevronDown class="text-muted-foreground ml-auto" />
          {:else}
            <ChevronUp class="text-muted-foreground ml-auto" />
          {/if}
        </button>
      {/snippet}
    </Collapsible.Trigger>
    <Collapsible.Content>
      {@render permission({
        header: 'Settings',
        read: Permission.SETTINGS_VIEW,
        read_key: 'settings$view',
        read_label: 'View Settings',
        write: Permission.SETTINGS_EDIT,
        write_key: 'settings$edit',
        write_label: 'Edit Settings'
      })}
      {@render permission({
        header: 'Groups',
        read: Permission.GROUP_VIEW,
        read_key: 'group$view',
        read_label: 'View Groups',
        write: Permission.GROUP_EDIT,
        write_key: 'group$edit',
        write_label: 'Edit Groups'
      })}
      {@render permission({
        header: 'Users',
        read: Permission.USER_VIEW,
        read_key: 'user$view',
        read_label: 'View Users',
        write: Permission.USER_EDIT,
        write_key: 'user$edit',
        write_label: 'Edit Users'
      })}
    </Collapsible.Content>
  </Collapsible.Root>
</div>

{#snippet permission({
  header,
  read,
  read_key,
  read_label,
  write,
  write_key,
  write_label
}: {
  header: string;
  read: Permission;
  read_key: FormPath<FormValue<typeof groupSettings>>;
  read_label: string;
  write: Permission;
  write_key: FormPath<FormValue<typeof groupSettings>>;
  write_label: string;
})}
  {#if user?.permissions.includes(read) || user?.permissions.includes(write)}
    <Collapsible.Root class="my-1 w-full pl-3" open={true}>
      <Collapsible.Trigger>
        {#snippet child({ props })}
          <button {...props} class="flex w-full cursor-pointer">
            <span class="text-sm">{header}</span>
            {#if props['data-state'] === 'closed'}
              <ChevronDown class="text-muted-foreground ml-auto" />
            {:else}
              <ChevronUp class="text-muted-foreground ml-auto" />
            {/if}
          </button>
        {/snippet}
      </Collapsible.Trigger>
      <Collapsible.Content class="pr-1 pl-3">
        {#if user?.permissions.includes(read)}
          <FormCheckbox
            {...props}
            key={read_key}
            label={read_label}
            disabled={readonly}
            {readonly}
          />
        {/if}
        {#if user?.permissions.includes(write)}
          <FormCheckbox
            {...props}
            key={write_key}
            label={write_label}
            disabled={readonly}
            {readonly}
          />
        {/if}
      </Collapsible.Content>
    </Collapsible.Root>
  {/if}
{/snippet}
