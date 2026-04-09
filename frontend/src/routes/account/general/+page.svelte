<script lang="ts">
  import BaseForm from 'positron-components/components/form/base-form.svelte';
  import { generalSettings } from './schema.svelte';
  import type { FormValue } from 'positron-components/components/form/types';
  import { Button } from 'positron-components/components/ui/button';
  import { Spinner } from 'positron-components/components/ui/spinner';
  import Save from '@lucide/svelte/icons/save';
  import { toast } from 'positron-components/components/util/general';
  import FormInput from 'positron-components/components/form/form-input.svelte';
  import * as ImageCropper from 'positron-components/components/ui-extra/image-cropper';
  import { arrayBufferToBase64 } from 'positron-components/util/convert.svelte';
  import { updateAccount, updateAvatar } from '$lib/client';

  let { data } = $props();

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
<BaseForm
  schema={generalSettings}
  {onsubmit}
  initialValue={{
    username: data.user?.name || ''
  }}
>
  {#snippet children({ props })}
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <ImageCropper.Root
          src={`data:image/webp;base64,${data.user?.avatar || ''}`}
          onCropped={async (url) => {
            let file = await ImageCropper.getFileFromUrl(url);
            let data = arrayBufferToBase64(await file.arrayBuffer());
            let ret = await updateAvatar({ body: { avatar: data } });
            if (ret.error && ret.response.status === 429) {
              toast.error('Rate limit exceeded. Please try again later.');
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
        />
      </div>
    </div>
  {/snippet}
  {#snippet footer({ isLoading }: { isLoading: boolean })}
    <div class="mt-4 grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
      <Button class="ml-auto cursor-pointer" type="submit" disabled={isLoading}>
        {#if isLoading}
          <Spinner />
        {:else}
          <Save />
        {/if}
        Save Changes</Button
      >
    </div>
  {/snippet}
</BaseForm>
