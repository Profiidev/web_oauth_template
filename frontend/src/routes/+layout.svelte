<script lang="ts">
  import { ModeWatcher } from '@profidev/pleiades/components/util/general';
  import { Toaster } from '@profidev/pleiades/components/ui/sonner';
  import '../app.css';
  import { connectWebsocket } from '$lib/backend/updater.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { items, noSidebarPaths } from '$lib/components/nav.svelte';
  import { setMode } from 'mode-watcher';
  import { logout, testToken, type UserInfo } from '$lib/client';
  import Sidebar from '@profidev/pleiades/components/nav/sidebar/sidebar.svelte';
  import { avatarUrl } from '$lib/permissions.svelte';

  // @ts-ignore this is injected at build time via Vite's define option
  let version = __version__;

  let { children, data } = $props();

  let user: UserInfo | undefined = $state();
  let blockRedirect = false;

  $effect(() => {
    data.user.then((u) => {
      user = u;
    });
  });

  onMount(() => {
    setMode('dark');
    testToken().then(async ({ data: dataRaw }) => {
      let { valid } = (dataRaw as { valid: boolean } | undefined) ?? {
        valid: false
      };
      // can also be undefined if there was an error
      if (valid === false) {
        if (!noSidebarPaths.includes(page.url.pathname) && !blockRedirect) {
          goto('/login');
        }
      } else {
        let user = await data.user;
        connectWebsocket(user.uuid);
      }
    });

    (async () => {
      let { data: status, error } = await data.setupStatus;
      if (error) return;

      if (!status?.is_setup && page.url.pathname !== '/setup') {
        blockRedirect = true;
        await goto('/setup');
        blockRedirect = false;
      }
    })();
  });
</script>

<ModeWatcher />
<Toaster position="top-right" closeButton={true} richColors={true} />

{#if noSidebarPaths.includes(page.url.pathname)}
  {@render children()}
{:else}
  <Sidebar
    {user}
    app_name="my-app"
    avatar={user ? `${avatarUrl}/${user.uuid}` : undefined}
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
