<!-- ThemeToggle.svelte — Botón para alternar entre tema claro y oscuro.
     Guarda la preferencia en localStorage y aplica data-theme al <html>. -->
<script lang="ts">
  import { onMount } from 'svelte';

  let theme = $state('dark');

  onMount(() => {
    // Leer tema guardado o defaultear a dark
    const saved = document.documentElement.getAttribute('data-theme') ||
                  localStorage.getItem('theme') ||
                  'dark';
    applyTheme(saved);
  });

  function applyTheme(newTheme: string) {
    theme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  const toggleTheme = () => applyTheme(theme === 'dark' ? 'light' : 'dark');
</script>

<button
  onclick={toggleTheme}
  class="theme-toggle-btn"
  aria-label="Cambiar tema"
>
  <span class="label font-cursive">mode:</span>
  <span class="value font-cursive">{theme}</span>
</button>

<style lang="postcss">
  @reference "../styles/global.css";
  .theme-toggle-btn {
    @apply flex items-center gap-2 px-3 py-1 font-mono text-xs transition-all border border-border-subtle hover:border-brand rounded-sm bg-background-soft/50;
  }
  .label {
    @apply text-muted transition-colors;
    .theme-toggle-btn:hover & {
      @apply text-foreground;
    }
  }
  .value {
    @apply text-brand font-bold uppercase;
  }
</style>
