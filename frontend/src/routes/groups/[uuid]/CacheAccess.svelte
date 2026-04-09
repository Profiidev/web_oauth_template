<script lang="ts">
  import Multiselect from 'positron-components/components/table/multiselect.svelte';
  import { Button } from 'positron-components/components/ui/form';
  import * as Select from 'positron-components/components/ui/select';
  import Trash from '@lucide/svelte/icons/trash';
  import Plus from '@lucide/svelte/icons/plus';
  import {
    AccessType,
    type CacheMapping,
    type SimpleCacheInfo
  } from '$lib/client';

  interface Props {
    caches: SimpleCacheInfo[];
    mappings: CacheMapping[];
    disabled?: boolean;
  }

  let { caches, mappings = $bindable(), disabled }: Props = $props();

  let remainingCaches = $derived(
    caches.filter(
      (cache) => !mappings.some((mapping) => mapping.uuid === cache.uuid)
    )
  );
</script>

<h5>Cache Access</h5>
<div class="flex grow flex-col">
  <div class="flex flex-col gap-2">
    {#each mappings as mapping, i}
      <div class="grid grid-cols-[1fr_1fr_2.5rem] gap-2">
        <Multiselect
          data={[mapping, ...remainingCaches].map((cache) => ({
            label: cache.name,
            value: cache.uuid
          }))}
          label="Cache"
          single
          selected={[mapping.uuid]}
          {disabled}
          onSelectChange={(selected) => {
            if (selected.length > 0) {
              mapping.uuid = selected[0];
            }
          }}
        />
        <Select.Root
          type="single"
          allowDeselect={false}
          value={mapping.access_type}
          {disabled}
          onValueChange={(value) => {
            // this needs to be done to trigger reactivity
            mappings = mappings.map((m, j) =>
              j === i ? { ...m, access_type: value as AccessType } : m
            );
          }}
        >
          <Select.Trigger class="w-full">{mapping.access_type}</Select.Trigger>
          <Select.Content>
            <Select.Item value={AccessType.VIEW} label={AccessType.VIEW} />
            <Select.Item value={AccessType.EDIT} label={AccessType.EDIT} />
          </Select.Content>
        </Select.Root>
        <Button
          size="icon"
          type="button"
          variant="destructive"
          class="min-w-10"
          {disabled}
          onclick={() => {
            mappings = mappings.filter((m) => m.uuid !== mapping.uuid);
          }}
        >
          <Trash />
        </Button>
      </div>
    {/each}
  </div>
  {#if remainingCaches.length > 0}
    <Button
      type="button"
      size="icon"
      class="mt-2"
      {disabled}
      onclick={() => {
        mappings = [
          ...mappings,
          {
            uuid: remainingCaches[0].uuid,
            name: remainingCaches[0].name,
            access_type: AccessType.VIEW
          }
        ];
      }}
    >
      <Plus />
    </Button>
  {/if}
</div>
