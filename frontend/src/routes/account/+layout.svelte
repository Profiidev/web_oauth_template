<script lang="ts">
  import { Separator } from 'positron-components/components/ui/separator';
  import SimpleSidebar from 'positron-components/components/nav/simple-sidebar.svelte';

  const { children } = $props();

  const routes = [
    {
      title: 'General',
      href: '/account/general'
    },
    {
      title: 'Authentication',
      href: '/account/auth'
    }
  ];
</script>

<div class="flex h-full w-full flex-col space-y-6 p-4">
  <div class="mt-1! mb-0 ml-7 flex items-center md:m-0">
    <h3 class="text-xl font-medium">Account</h3>
  </div>
  <Separator class="my-4" />
  <div
    class="flex grow flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-6"
  >
    <aside class="lg:w-40">
      <SimpleSidebar items={routes} class="" />
    </aside>
    <Separator orientation="horizontal" class="lg:hidden" />
    <Separator orientation="vertical" class="hidden lg:block" />
    <div class="flex-1">
      {@render children()}
    </div>
  </div>
</div>
