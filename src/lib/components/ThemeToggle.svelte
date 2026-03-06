<script lang="ts">
  import { onMount } from "svelte";

  let theme = $state("dark");

  onMount(() => {
    // Tema oscuro como default
    const currentTheme = document.documentElement.getAttribute('data-theme') || 
                         localStorage.getItem("theme") || 
                         "dark";
    
    applyTheme(currentTheme);
  });

  function applyTheme(newTheme: string) {
    theme = newTheme;
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  const toggleTheme = () => applyTheme(theme === "dark" ? "light" : "dark");
</script>

<button
  onclick={toggleTheme}
  class="theme-toggle-btn"
  aria-label="Cambiar tema"
>
  <span class="label">MODE:</span>
  <span class="value">{theme}</span>
</button>

<style lang="postcss">
  @reference "../../app.css";
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
