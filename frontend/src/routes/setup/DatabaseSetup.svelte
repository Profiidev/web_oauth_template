<script lang="ts">
  import type { StageProps } from 'positron-components/components/form/types';
  import BaseForm from 'positron-components/components/form/base-form.svelte';
  import { databaseSetupSchema } from './schema.svelte';
  import FormCheckbox from 'positron-components/components/form/form-checkbox.svelte';
  import * as Alert from 'positron-components/components/ui/alert';
  import AlertCircle from '@lucide/svelte/icons/alert-circle';

  let {
    initialValue,
    onsubmit,
    footer,
    isLoading,
    data
  }: StageProps<{
    db_backend: string;
  }> = $props();

  let form: BaseForm<typeof databaseSetupSchema> | undefined = $state();

  export const getValue = () => {
    return form?.getValue();
  };
</script>

<BaseForm
  {onsubmit}
  {initialValue}
  {footer}
  bind:isLoading
  schema={databaseSetupSchema}
>
  {#snippet children({ props })}
    <Alert.Root variant="default" class="text-orange-500">
      <AlertCircle />
      <Alert.Title>Disclaimer</Alert.Title>
      <Alert.Description>
        <p class="text-orange-500">
          You are currently using <strong>{data.db_backend}</strong> as
          database. When this is not your intended database, set the
          <strong>DB_URL</strong> environment variable before continuing with the
          setup.
        </p>
      </Alert.Description>
    </Alert.Root>
    <FormCheckbox
      {...props}
      label="I have read the disclaimer"
      key="disclaimerAccepted"
      switchOrder
    />
  {/snippet}
</BaseForm>
