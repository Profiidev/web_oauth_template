<script lang="ts">
  import { goto } from '$app/navigation';
  import { toast } from 'positron-components/components/util/general';
  import type { Stage } from 'positron-components/components/form/types';
  import MultiStepForm from 'positron-components/components/form/multistep-form.svelte';
  import Information from './Information.svelte';
  import { createUser } from '$lib/client';
  import { getEncrypt } from '$lib/backend/auth.svelte';

  let { data } = $props();

  let stages: Stage<{
    mailActive: boolean;
  }>[] = [
    {
      title: 'Create User',
      content: Information,
      data: {}
    }
  ];

  const submit = async (rawData: object) => {
    let anyData = rawData as any;
    if (
      !data.mailActive &&
      (!anyData.password || anyData.password.length < 6)
    ) {
      return {
        error: 'Password must be at least 6 characters long.',
        field: 'password'
      };
    }

    let encrypt = getEncrypt();
    if (!encrypt) {
      return {
        error: 'Encryption function not available.',
        field: 'password'
      };
    }

    let encrypted_password = encrypt.encrypt(anyData.password || '');
    anyData.password = encrypted_password || '';

    let res = await createUser({
      body: anyData
    });

    if (!res.data) {
      if (res.response.status === 409) {
        return {
          error: 'A user with this email already exists.',
          field: 'email'
        };
      } else {
        return { error: 'Error creating user.' };
      }
    } else {
      toast.success('User created successfully.');
      setTimeout(() => {
        goto(`/users/${res.data.uuid}`);
      });
    }
  };
</script>

<MultiStepForm
  {stages}
  onsubmit={submit}
  data={{ mailActive: data.mailActive }}
  cancelHref="/users"
/>
