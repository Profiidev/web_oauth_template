<script lang="ts">
  import '../app.css';
  let { children } = $props();
  let x: string = 0;
</script>

<div class="h-full w-full bg-black" onclick={() => {}}>
  {@render children()}
</div>
