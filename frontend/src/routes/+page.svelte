<script lang="ts">
	import { PUBLIC_BACKEND_URL } from '$env/static/public';
	const click = () => {
		fetch(`${PUBLIC_BACKEND_URL}/auth/oidc/start_auth`)
			.then((res) => res.text())
			.then((text) => (window.location.href = text));
	};
</script>

<button onclick={click} class="text-white"> Test </button>
