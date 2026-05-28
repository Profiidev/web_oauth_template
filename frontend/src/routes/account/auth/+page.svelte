<script lang="ts">
  import Password from './Password.svelte';
  import type { UserInfo } from '$lib/client';
  import Email from './Email.svelte';

  const { data } = $props();

  let user: UserInfo | undefined = $state();
  let mailActive: boolean = $state(false);

  $effect(() => {
    data.user.then((userInfo) => {
      user = userInfo;
    });
  });

  $effect(() => {
    data.mailActive.then((active) => {
      mailActive = active;
    });
  });
</script>

<div class="mt-4 grid w-full grid-cols-1 gap-8 2xl:grid-cols-2">
  <div>
    <h4 class="mb-2">Authentication</h4>
    <Password oidc={user?.oidc_user ?? false} />
    <Email
      email={user?.email ?? ''}
      oidc={user?.oidc_user ?? false}
      {mailActive}
    />
  </div>
</div>
