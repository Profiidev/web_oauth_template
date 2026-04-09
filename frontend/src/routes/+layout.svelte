<script lang="ts">
  import { ModeWatcher } from 'positron-components/components/util/general';
  import { Toaster } from 'positron-components/components/ui/sonner';
  import '../app.css';
  import { connectWebsocket } from '$lib/backend/updater.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { items, noSidebarPaths } from '$lib/components/nav.svelte';
  import { setMode } from 'mode-watcher';
  import { logout, testToken } from '$lib/client';
  import Sidebar from 'positron-components/components/nav/sidebar/sidebar.svelte';

  // @ts-ignore this is injected at build time via Vite's define option
  let version = __version__;

  let { children, data } = $props();

  onMount(() => {
    setMode('dark');
    testToken().then(({ data: dataRaw }) => {
      let { valid } = (dataRaw as { valid: boolean } | undefined) ?? {
        valid: false
      };
      // can also be undefined if there was an error
      if (valid === false) {
        if (!noSidebarPaths.includes(page.url.pathname)) {
          goto('/login');
        }
      } else {
        connectWebsocket(data.user?.uuid ?? '');
      }
    });
  });
</script>

<ModeWatcher />
<Toaster position="top-right" closeButton={true} richColors={true} />

{#if noSidebarPaths.includes(page.url.pathname)}
  {@render children()}
{:else}
  <Sidebar
    user={data.user
      ? {
          ...data.user,
          avatar: data.user.avatar || undefined
        }
      : {
          email: '',
          name: '',
          permissions: []
        }}
    app_name="my-app"
    {version}
    {items}
    logout={async () => {
      let res = await logout();
      return {
        error: res.error ? 'err' : undefined
      };
    }}
  >
    {@render children()}
  </Sidebar>
{/if}
