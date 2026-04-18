<script lang="ts">
  import BaseForm from '@profidev/pleiades/components/form/base-form.svelte';
  import { information } from './schema.svelte';
  import FormInput from '@profidev/pleiades/components/form/form-input.svelte';
  import type { StageProps } from '@profidev/pleiades/components/form/types';
  import FormInputPassword from '@profidev/pleiades/components/form/form-input-password.svelte';

  let {
    initialValue,
    onsubmit,
    footer,
    isLoading,
    data
  }: StageProps<{
    mailActive: boolean;
  }> = $props();

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
      label="User Name"
      placeholder="Enter user name"
    />
    <FormInput
      {...props}
      key="email"
      label="Email"
      placeholder="Enter email"
      type="email"
    />
    {#if !data.mailActive}
      <FormInputPassword
        {...props}
        key="password"
        label="Password"
        placeholder="Enter password"
      />
    {/if}
  {/snippet}
</BaseForm>
