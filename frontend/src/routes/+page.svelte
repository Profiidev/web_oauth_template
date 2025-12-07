<script lang="ts">
  import { get_oidc_url, logout, test_token } from '$lib/backend/auth.svelte';

  const login = async () => {
    let url = await get_oidc_url();
    if (url) {
      window.location.href = url;
    }
  };

  let valid = $state();
  const test = async () => {
    valid = await test_token();
  };
</script>

<button onclick={login} class="text-white"> Login </button>
<button onclick={logout} class="text-white"> Logout </button>
<button onclick={test} class="text-white"> Test </button>
<p class="text-white">Valid: {valid}</p>
