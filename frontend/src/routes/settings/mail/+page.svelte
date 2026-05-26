<script lang="ts">
  import BaseForm from '@profidev/pleiades/components/form/base-form.svelte';
  import { mailSettings, unReformat } from './schema.svelte';
  import type { FormValue } from '@profidev/pleiades/components/form/types';
  import { Button } from '@profidev/pleiades/components/ui/button';
  import { Spinner } from '@profidev/pleiades/components/ui/spinner';
  import Save from '@lucide/svelte/icons/save';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import { toast } from '@profidev/pleiades/components/util/general';
  import { Permission } from '$lib/permissions.svelte';
  import FormSwitch from '@profidev/pleiades/components/form/form-switch.svelte';
  import FormInput from '@profidev/pleiades/components/form/form-input.svelte';
  import FormInputPassword from '@profidev/pleiades/components/form/form-input-password.svelte';
  import Send from '@lucide/svelte/icons/send';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import {
    saveMailSettings,
    testMail,
    type MailSettingsResponse,
    type UserInfo
  } from '$lib/client';

  let { data } = $props();

  let settings: MailSettingsResponse | undefined = $state();
  let user: UserInfo | undefined = $state();
  let isLoading = $state(false);
  let form: BaseForm<typeof mailSettings> | undefined = $state();

  let readonly = $derived(
    !user?.permissions.includes(Permission.SETTINGS_EDIT)
  );

  $effect(() => {
    data.user.then((userInfo) => {
      user = userInfo;
    });
  });

  $effect(() => {
    data.settings.then((settingsInfo) => {
      settings = settingsInfo;
      form?.setValue(
        unReformat(
          settings?.settings ?? {
            smtp_enabled: false
          }
        )
      );
    });
  });

  const onsubmit = async (form: FormValue<typeof mailSettings>) => {
    let ret = await saveMailSettings({ body: form });

    if (ret.error) {
      if (ret.response?.status === 406) {
        return {
          field: 'smtp_from_address',
          error: 'Invalid From Address provided'
        } as const;
      } else if (ret.response?.status === 400) {
        return {
          field: 'smtp_server',
          error: 'Failed to create SMTP transport with provided settings'
        } as const;
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
    if (ret.error && ret.response?.status === 429) {
      toast.error('Rate limit exceeded. Please try again later.');
    } else if (ret.error) {
      toast.error('Failed to send test email. Check SMTP settings.');
    } else {
      toast.success('Test email sent successfully.');
    }
  };
</script>

<h4 class="mb-2">Mail Settings</h4>

<BaseForm schema={mailSettings} {onsubmit} bind:this={form} bind:isLoading>
  {#snippet children({ props })}
    <div class="grid grid-cols-1 gap-8 xl:grid-cols-2">
      <div class="flex flex-col gap-1">
        <FormSwitch
          {...props}
          key="smtp_enabled"
          label="Enable SMTP"
          disabled={readonly || settings?.from_env.includes('smtp_enabled')}
        />
        <FormInput
          {...props}
          label="SMTP Host"
          key="smtp_server"
          placeholder="mail.example.com"
          disabled={readonly || settings?.from_env.includes('smtp_server')}
        />
        <FormInput
          {...props}
          label="SMTP Port"
          key="smtp_port"
          placeholder="587"
          type="number"
          disabled={readonly || settings?.from_env.includes('smtp_port')}
        />
        <FormInput
          {...props}
          label="SMTP Username"
          key="smtp_username"
          placeholder="user@example.com"
          disabled={readonly || settings?.from_env.includes('smtp_username')}
        />
        <FormInputPassword
          {...props}
          label="SMTP Password"
          key="smtp_password"
          placeholder="Password"
          disabled={readonly || settings?.from_env.includes('smtp_password')}
        />
        <FormInput
          {...props}
          label="From Address"
          key="smtp_from_address"
          placeholder="no-reply@example.com"
          disabled={readonly ||
            settings?.from_env.includes('smtp_from_address')}
        />
        <FormInput
          {...props}
          label="From Name"
          key="smtp_from_name"
          placeholder="Example App"
          disabled={readonly || settings?.from_env.includes('smtp_from_name')}
        />
        <FormSwitch
          {...props}
          key="smtp_use_tls"
          label="Use TLS"
          disabled={readonly || settings?.from_env.includes('smtp_use_tls')}
        />
      </div>
    </div>
  {/snippet}
  {#snippet footer({
    isLoading,
    isError
  }: {
    isLoading: boolean;
    isError: boolean;
  })}
    <div class="grid w-full grid-cols-1 gap-8 xl:grid-cols-2">
      <div class="flex flex-col">
        {#if (settings?.from_env.length ?? 0) > 0}
          <div class="mb-2 flex items-center">
            <TriangleAlert class="size-6 min-h-6 min-w-6 text-yellow-600" />
            <p class="ml-2 text-yellow-600">
              Values loaded from environment variables cannot be edited here.
            </p>
          </div>
        {/if}
        <div class="mt-4 flex">
          {#if !readonly && settings?.settings?.smtp_enabled}
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
            variant={isError ? 'destructive' : undefined}
          >
            {#if isLoading}
              <Spinner />
            {:else if isError}
              <RotateCcw />
            {:else}
              <Save />
            {/if}
            {isError ? 'Retry' : 'Save Changes'}</Button
          >
        </div>
      </div>
    </div>
  {/snippet}
</BaseForm>
