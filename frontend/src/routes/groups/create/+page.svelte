<script lang="ts">
  import { goto } from '$app/navigation';
  import { toast } from '@profidev/pleiades/components/util/general';
  import type { Stage } from '@profidev/pleiades/components/form/types';
  import MultiStepForm from '@profidev/pleiades/components/form/multistep-form.svelte';
  import Information from './Information.svelte';
  import { createGroup } from '$lib/client';

  let stages: Stage[] = [
    {
      title: 'Create Group',
      content: Information,
      data: {}
    }
  ];

  const submit = async (rawData: object) => {
    let res = await createGroup({ body: rawData as any });

    if (!res.data) {
      if (res.response.status === 409) {
        return {
          error: 'A group with this name already exists.',
          field: 'name'
        };
      } else {
        return { error: 'Error creating group.' };
      }
    } else {
      toast.success('Group created successfully.');
      setTimeout(() => {
        goto(`/groups/${res.data.uuid}`);
      });
    }
  };
</script>

<MultiStepForm {stages} onsubmit={submit} cancelHref="/groups" />
