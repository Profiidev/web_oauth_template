<script lang="ts">
  import type { Stage } from '@profidev/pleiades/components/form/types';
  import MultiStepForm from '@profidev/pleiades/components/form/multistep-form.svelte';
  import AdminUser from './AdminUser.svelte';
  import DatabaseSetup from './DatabaseSetup.svelte';
  import CheckIcon from '@lucide/svelte/icons/check';
  import type { FormValue } from '@profidev/pleiades/components/form/types';
  import type { adminUser } from './schema.svelte';
  import { goto, invalidate } from '$app/navigation';
  import { connectWebsocket } from '$lib/backend/updater.svelte';
  import { completeSetup } from '$lib/client';
  import { getEncrypt } from '$lib/backend/auth.svelte';

  let { data } = $props();

  let stages: Stage<{ db_backend: string }>[] = [
    {
      title: 'Database Setup',
      content: DatabaseSetup,
      data: {}
    },
    {
      title: 'Admin User',
      content: AdminUser,
      data: {}
    }
  ];

  const submit = async (rawData: object) => {
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
  };
</script>

<MultiStepForm
  {stages}
  onsubmit={submit}
  {data}
  submitLabel="Finish"
  submitIcon={CheckIcon}
  cancelHref="/"
/>
