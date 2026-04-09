<script lang="ts">
  import type { StageProps } from 'positron-components/components/form/types';
  import BaseForm from 'positron-components/components/form/base-form.svelte';
  import { adminUser } from './schema.svelte';
  import FormInput from 'positron-components/components/form/form-input.svelte';
  import FormInputPassword from 'positron-components/components/form/form-input-password.svelte';

  let {
    initialValue,
    onsubmit,
    footer,
    isLoading
  }: StageProps<{
    db_backend: string;
    storage_backend: string;
  }> = $props();

  let form: BaseForm<typeof adminUser> | undefined = $state();

  export const getValue = () => {
    return form?.getValue();
  };
</script>

<BaseForm {onsubmit} {initialValue} {footer} bind:isLoading schema={adminUser}>
  {#snippet children({ props })}
    <FormInput
      {...props}
      label="Username"
      key="username"
      placeholder="Enter username"
    />
    <FormInput
      {...props}
      label="Email"
      key="email"
      type="email"
      placeholder="Enter email"
    />
    <FormInputPassword
      {...props}
      label="Password"
      key="password"
      placeholder="Enter password"
    />
  {/snippet}
</BaseForm>
