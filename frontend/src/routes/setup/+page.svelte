<script lang="ts">
  import type { Stage } from '@profidev/pleiades/components/form/types';
  import MultiStepForm from '@profidev/pleiades/components/form/multistep-form.svelte';
  import DatabaseSetup from './DatabaseSetup.svelte';
  import CheckIcon from '@lucide/svelte/icons/check';
  import type { FormValue } from '@profidev/pleiades/components/form/types';
  import type { adminUser } from './schema.svelte';
  import { goto, invalidate } from '$app/navigation';
  import { connectWebsocket } from '$lib/backend/updater.svelte';
  import { completeSetup, initOidc } from '$lib/client';
  import { getEncrypt, getOidcUrl } from '$lib/backend/auth.svelte';
  import UserSetup from './UserSetup.svelte';
  import { reformat, type userSettings } from '../settings/user/schema.svelte';

  let { data } = $props();

  let stages: Stage<{
    db_backend: string;
    from_env: string[];
    site_url: string;
    configured: boolean;
  }>[] = [
    {
      title: 'Database Setup',
      content: DatabaseSetup,
      data: {
        // svelte-ignore state_referenced_locally
        disclaimerAccepted: data.configured
      }
    },
    {
      title: 'User Setup',
      content: UserSetup,
      // svelte-ignore state_referenced_locally
      data: data.settings?.settings ?? {}
    }
  ];

  const submit = async (rawData: object) => {
    if ((rawData as any).oidc) {
      let formData: FormValue<typeof userSettings> = rawData as any;

      let ret = await initOidc({
        body: reformat(formData, data.settings?.from_env ?? [])
      });

      if (ret.error) {
        if (ret.response?.status === 406) {
          return {
            field: 'oidc_issuer',
            error:
              'Invalid OIDC configuration URL. Check the server logs for more information.'
          } as const;
        } else {
          return {
            error:
              'An unknown error occurred. Check the server logs for more information.'
          };
        }
      } else {
        let url = await getOidcUrl();
        if (url) {
          window.location.href = url;
        } else {
          return {
            error:
              'Failed to retrieve OIDC URL. Check the server logs for more information.'
          };
        }
      }
    } else {
      let formData: FormValue<typeof adminUser> = rawData as any;
      let encrypt = getEncrypt();
      if (!encrypt) {
        return {
          error: 'Encryption function not available. Please try again later.'
        };
      }

      let ret = await completeSetup({
        body: {
          admin_email: formData.email,
          admin_password: encrypt.encrypt(formData.password) || '',
          admin_username: formData.username
        }
      });

      if (!ret.data) {
        if (ret.response?.status === 409) {
          return { error: 'The setup was already completed.' };
        } else if (ret.response?.status === 500) {
          return { error: 'The server failed to find the admin group.' };
        } else {
          return { error: 'An unknown error occurred.' };
        }
      } else {
        setTimeout(async () => {
          let user = ((await ret.data) as { user?: string } | undefined)?.user;
          connectWebsocket(user || '');
          await invalidate('/api/user/info');
          await goto('/');
        });
      }
    }
  };
</script>

<MultiStepForm
  {stages}
  onsubmit={submit}
  data={{
    db_backend: data.db_backend,
    from_env: data.settings?.from_env ?? [],
    site_url: data.settings?.site_url ?? '',
    configured: data.configured
  }}
  submitLabel="Finish"
  submitIcon={CheckIcon}
  cancelHref="/"
/>
