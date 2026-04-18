<script lang="ts">
  import BaseForm from '@profidev/pleiades/components/form/base-form.svelte';
  import { mailSettings, reformat, unReformat } from './schema.svelte';
  import type { FormValue } from '@profidev/pleiades/components/form/types';
  import { Button } from '@profidev/pleiades/components/ui/button';
  import { Spinner } from '@profidev/pleiades/components/ui/spinner';
  import Save from '@lucide/svelte/icons/save';
  import { toast } from '@profidev/pleiades/components/util/general';
  import { Permission } from '$lib/permissions.svelte';
  import FormSwitch from '@profidev/pleiades/components/form/form-switch.svelte';
  import FormInput from '@profidev/pleiades/components/form/form-input.svelte';
  import FormInputPassword from '@profidev/pleiades/components/form/form-input-password.svelte';
  import Send from '@lucide/svelte/icons/send';
  import { saveMailSettings, testMail } from '$lib/client';

  let { data } = $props();

  // svelte-ignore state_referenced_locally
  let smtpEnabled = $state(!!data.settings?.smtp);
  $effect(() => {
    smtpEnabled = !!data.settings?.smtp;
  });
  let readonly = $derived(
    !data.user?.permissions.includes(Permission.SETTINGS_EDIT)
  );
  let isLoading = $state(false);

  const onsubmit = async (form: FormValue<typeof mailSettings>) => {
    let data = reformat(form);
    let ret = await saveMailSettings({ body: data });

    if (ret.error) {
      if (ret.response.status === 406) {
        return {
          field: 'smtp_from_address',
          error: 'Invalid From Address provided'
        };
      } else if (ret.response.status === 400) {
        return {
          field: 'smtp_host',
          error: 'Failed to create SMTP transport with provided settings'
        };
      }
      toast.error('Failed to save mail settings');
    } else {
      toast.success('Mail settings saved successfully');
    }
    // do not trigger form reset
    return { error: '' };
  };

  const testEmail = async () => {
    isLoading = true;
    let ret = await testMail();
    isLoading = false;
    if (ret.error && ret.response.status === 429) {
      toast.error('Rate limit exceeded. Please try again later.');
    } else if (ret.error) {
      toast.error('Failed to send test email. Check SMTP settings.');
    } else {
      toast.success('Test email sent successfully.');
    }
  };
</script>

<h4 class="mb-2">Mail Settings</h4>
<BaseForm
  schema={mailSettings}
  {onsubmit}
  initialValue={unReformat(data.settings ?? {})}
  bind:isLoading
>
  {#snippet children({ props })}
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div class="flex flex-col gap-1">
        <FormSwitch
          {...props}
          key="smtp_enabled"
          label="Enable SMTP"
          onCheckedChange={(v) => (smtpEnabled = v)}
          disabled={readonly}
        />
        {#if smtpEnabled}
          <FormInput
            {...props}
            label="SMTP Host"
            key="smtp_host"
            placeholder="mail.example.com"
            {readonly}
          />
          <FormInput
            {...props}
            label="SMTP Port"
            key="smtp_port"
            placeholder="587"
            type="number"
            {readonly}
          />
          <FormInput
            {...props}
            label="SMTP Username"
            key="smtp_user"
            placeholder="user@example.com"
            {readonly}
          />
          <FormInputPassword
            {...props}
            label="SMTP Password"
            key="smtp_password"
            placeholder="Password"
            {readonly}
          />
          <FormInput
            {...props}
            label="From Address"
            key="smtp_from_address"
            placeholder="no-reply@example.com"
            {readonly}
          />
          <FormInput
            {...props}
            label="From Name"
            key="smtp_from_name"
            placeholder="Example App"
            {readonly}
          />
          <FormSwitch
            {...props}
            key="use_tls"
            label="Use TLS"
            disabled={readonly}
          />
        {/if}
      </div>
    </div>
  {/snippet}
  {#snippet footer({ isLoading }: { isLoading: boolean })}
    <div class="mt-4 grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
      <div class="flex">
        {#if !readonly && smtpEnabled}
          <Button
            disabled={isLoading}
            variant="secondary"
            onclick={testEmail}
            class="cursor-pointer"
          >
            <Send />
            Send Test Email
          </Button>
        {/if}
        <Button
          class="ml-auto cursor-pointer"
          type="submit"
          disabled={isLoading}
        >
          {#if isLoading}
            <Spinner />
          {:else}
            <Save />
          {/if}
          Save Changes</Button
        >
      </div>
    </div>
  {/snippet}
</BaseForm>
