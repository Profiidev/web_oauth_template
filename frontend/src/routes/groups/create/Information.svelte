<script lang="ts">
  import BaseForm from 'positron-components/components/form/base-form.svelte';
  import { type FormValue } from 'positron-components/components/form/types';
  import type { ComponentProps, Snippet } from 'svelte';
  import { information } from './schema.svelte';
  import FormInput from 'positron-components/components/form/form-input.svelte';

  interface Props {
    initialValue?: FormValue<typeof information>;
    onsubmit: ComponentProps<typeof BaseForm>['onsubmit'];
    footer: Snippet<[{ isLoading: boolean }]>;
    isLoading: boolean;
    readonly?: boolean;
  }

  let { initialValue, onsubmit, footer, isLoading, readonly }: Props = $props();

  let form: BaseForm<typeof information> | undefined = $state();

  export const getValue = () => {
    return form?.getValue();
  };
</script>

<BaseForm
  schema={information}
  {onsubmit}
  {footer}
  {initialValue}
  bind:this={form}
  bind:isLoading
>
  {#snippet children({ props })}
    <FormInput
      {...props}
      key="name"
      label="Group Name"
      placeholder="Enter group name"
      {readonly}
      required
    />
  {/snippet}
</BaseForm>
