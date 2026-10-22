<script lang="ts">
  import '$lib/styles/tokens.css';
  import { onMount } from 'svelte';
  import { themeMode } from '$lib/stores/theme';

  onMount(() => {
    const current = localStorage.getItem('quick-notes-theme') ?? 'system';
    themeMode.set(current as 'system' | 'light' | 'dark');
  });
</script>

<slot />
