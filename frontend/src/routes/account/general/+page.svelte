<script lang="ts">
  import BaseForm from '@profidev/pleiades/components/form/base-form.svelte';
  import { generalSettings } from './schema.svelte';
  import type { FormValue } from '@profidev/pleiades/components/form/types';
  import { Button } from '@profidev/pleiades/components/ui/button';
  import { Spinner } from '@profidev/pleiades/components/ui/spinner';
  import Save from '@lucide/svelte/icons/save';
  import { toast } from '@profidev/pleiades/components/util/general';
  import FormInput from '@profidev/pleiades/components/form/form-input.svelte';
  import * as ImageCropper from '@profidev/pleiades/components/ui-extra/image-cropper';
  import { arrayBufferToBase64 } from '@profidev/pleiades/util/convert.svelte';
  import { updateAccount, updateAvatar, type UserInfo } from '$lib/client';
  import { avatarUrl } from '$lib/permissions.svelte';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

  let { data } = $props();

  let user: UserInfo | undefined = $state();
  let form: BaseForm<typeof generalSettings> | undefined = $state();

  $effect(() => {
    data.user.then((d) => {
      user = d;
      form?.setValue({
        username: user.name
      });
    });
  });

  const onsubmit = async (form: FormValue<typeof generalSettings>) => {
    let ret = await updateAccount({ body: form });

    if (ret.error) {
      toast.error('Failed to save general settings');
    } else {
      toast.success('General settings saved successfully');
    }
    // do not trigger form reset
    return { error: '' };
  };
</script>

<h4 class="mb-2">General Settings</h4>
<BaseForm schema={generalSettings} {onsubmit} bind:this={form}>
  {#snippet children({ props })}
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <ImageCropper.Root
          src={user ? `${avatarUrl}/${user.uuid}` : undefined}
          onCropped={async (url) => {
            let file = await ImageCropper.getFileFromUrl(url);
            let data = arrayBufferToBase64(await file.arrayBuffer());
            let ret = await updateAvatar({ body: { avatar: data } });
            if (ret.error && ret.response?.status === 429) {
              toast.error('Rate limit exceeded. Please try again later.');
            } else if (ret.error && ret.response?.status === 413) {
              toast.error('File too large. Please upload a smaller file.');
            } else if (ret.error) {
              toast.error('Failed to update avatar');
            } else {
              toast.success('Avatar updated successfully');
            }
          }}
          onUnsupportedFile={(file) => {
            toast.error(`Unsupported file type: ${file.type}`);
          }}
        >
          <ImageCropper.UploadTrigger>
            <ImageCropper.Preview />
          </ImageCropper.UploadTrigger>
          <ImageCropper.Dialog>
            <ImageCropper.Cropper />
            <ImageCropper.Controls>
              <ImageCropper.Cancel />
              <ImageCropper.Crop />
            </ImageCropper.Controls>
          </ImageCropper.Dialog>
        </ImageCropper.Root>
        <FormInput
          {...props}
          label="Username"
          key="username"
          placeholder="Enter your username"
          disabled={!user}
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
    <div class="mt-4 grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
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
  {/snippet}
</BaseForm>
