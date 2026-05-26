<script lang="ts">
  import * as Avatar from '@profidev/pleiades/components/ui/avatar';

  let {
    src,
    class: className,
    alt = 'Avatar'
  }: { src: string; class: string; alt?: string } = $props();
</script>

<Avatar.Root class={className}>
  <Avatar.Image {src} {alt} />
  <Avatar.Fallback>?</Avatar.Fallback>
</Avatar.Root>
