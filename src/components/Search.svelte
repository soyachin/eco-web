<!-- Search.svelte — Búsqueda con Pagefind. Dos modos: sidebar inline y modal fullscreen.
     El modal se abre con Ctrl+K / Cmd+K desde cualquier página.
     El listener de teclado se registra en onMount para evitar errores de SSR. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { Search as SearchIcon } from 'lucide-svelte';

  interface SearchResult {
    id: string;
    url: string;
    meta: { title?: string };
    excerpt: string;
  }

  let { isSidebar = false, isOpen = $bindable(false) } = $props();

  let searchTerm = $state('');
  let results = $state<SearchResult[]>([]);
  let selectedIndex = $state(0);
  let searchInput: HTMLInputElement | undefined = $state();

  // @ts-ignore — Pagefind no exporta tipos TypeScript oficiales
  let pagefind: any = null;

  onMount(() => {
    const initPagefind = async () => {
      // Evitar cargar Pagefind en desarrollo para no disparar advertencias del router de Astro,
      // ya que el índice solo se genera tras el build.
      if (import.meta.env.DEV) {
        console.info('[Search] Modo desarrollo: Pagefind omitido.');
        return;
      }
      try {
        // Pagefind se genera en build, no existe en dev.
        // Usamos una variable para evitar que Vite intente resolverlo estáticamente.
        const pagefindPath = '/pagefind/pagefind.js';
        pagefind = await import(/* @vite-ignore */ pagefindPath);
        await pagefind.init();
      } catch {
        // En modo dev no hay índice de Pagefind todavía; silenciar el error
        console.info('[Search] Índice de Pagefind no disponible.');
      }
    };

    initPagefind();

    if (!isSidebar) {
      const onKey = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          isOpen = !isOpen;
        }
        if (e.key === 'Escape') isOpen = false;
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  });

  // Enfocar el input cuando el modal se abre
  $effect(() => {
    if (!isSidebar && isOpen) searchInput?.focus();
  });

  // Debounce simple: 150ms después de que el usuario deja de escribir
  let debounceTimer: ReturnType<typeof setTimeout>;
  $effect(() => {
    const term = searchTerm;
    clearTimeout(debounceTimer);

    if (!pagefind || !term.trim() || term.length < 2) {
      results = [];
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await pagefind.search(term);
        // Cargar datos completos de los primeros 10 resultados
        const loaded = await Promise.all(res.results.slice(0, 10).map((r: any) => r.data()));
        results = loaded;
        selectedIndex = 0;
      } catch {
        results = [];
      }
    }, 150);
  });

  function handleKeydown(e: KeyboardEvent) {
    if (!results.length) return;
    if (e.key === 'ArrowDown') { selectedIndex = (selectedIndex + 1) % results.length; e.preventDefault(); }
    else if (e.key === 'ArrowUp') { selectedIndex = (selectedIndex - 1 + results.length) % results.length; e.preventDefault(); }
    else if (e.key === 'Enter' && results[selectedIndex]) navigate(results[selectedIndex].url);
  }

  function navigate(url: string) {
    if (!isSidebar) isOpen = false;
    searchTerm = '';
    window.location.href = url;
  }
</script>

{#if isSidebar || isOpen}
  {#if !isSidebar}
    <div
      class="search-overlay"
      onclick={() => (isOpen = false)}
      onkeydown={e => e.key === 'Escape' && (isOpen = false)}
      role="button"
      tabindex="0"
    >
      <div class="search-modal" onclick={e => e.stopPropagation()} role="none">
        {@render searchUI()}
      </div>
    </div>
  {:else}
    <div class="search-sidebar-container">
      {@render searchUI()}
    </div>
  {/if}
{/if}

{#snippet searchUI()}
  <div class="search-wrapper">
    <header class="search-header">
      <SearchIcon size={18} class="search-icon" />
      <input
        bind:this={searchInput}
        bind:value={searchTerm}
        onkeydown={handleKeydown}
        type="text"
        placeholder={isSidebar ? 'Buscar...' : 'Busca notas o #tags...'}
        class="search-input {isSidebar ? 'text-sm' : 'text-lg'}"
      />
      {#if !isSidebar}
        <kbd class="kbd-hint">Esc</kbd>
      {/if}
    </header>

    {#if results.length > 0}
      <div class="results-container {isSidebar ? 'max-h-[300px]' : 'max-h-[60vh]'} custom-scrollbar">
        {#each results as res, i}
          <button
            onclick={() => navigate(res.url)}
            class="result-item {i === selectedIndex ? 'selected' : ''}"
          >
            <span class="result-title">{res.meta?.title ?? res.url}</span>
            {#if res.excerpt}
              <p class="search-snippet">{@html res.excerpt}</p>
            {/if}
          </button>
        {/each}
      </div>
    {:else if searchTerm.trim()}
      <div class="no-results">No hay resultados</div>
    {/if}

    {#if !isSidebar && results.length > 0}
      <footer class="search-footer">
        <span><b>↑↓</b> navegar</span>
        <span><b>Enter</b> abrir</span>
      </footer>
    {/if}
  </div>
{/snippet}

<style lang="postcss">
  @reference "../styles/global.css";

  .search-overlay {
    @apply fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 backdrop-blur-sm bg-black/40;
  }
  .search-modal {
    @apply w-full max-w-2xl bg-background-soft border border-border-subtle rounded-xl shadow-2xl overflow-hidden;
  }
  .search-sidebar-container {
    @apply w-full border border-border-subtle rounded-lg overflow-hidden flex flex-col;
    background-color: color-mix(in srgb, var(--bg-secondary) 20%, transparent);
  }
  .search-wrapper { @apply flex flex-col; }
  .search-header {
    @apply flex items-center gap-3 p-3 border-b border-border-subtle bg-background-soft/50;
  }
  :global(.search-icon) { @apply text-muted; }
  .search-input {
    @apply flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted/40;
  }
  .kbd-hint {
    @apply px-2 py-1 rounded-md bg-white/5 border border-white/10 text-sm text-muted font-mono uppercase;
  }
  .results-container { @apply overflow-y-auto p-2; }
  .result-item {
    @apply w-full flex flex-col gap-0.5 p-3 rounded-md text-left transition-colors duration-150 hover:bg-white/5 text-sm text-muted;
    &.selected { @apply bg-brand/10 text-foreground/80 pl-2.5; }
  }
  .result-title { @apply font-bold text-base text-foreground; }
  .search-snippet {
    @apply text-[0.7rem] leading-relaxed text-muted/60 font-mono mt-1 italic;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  :global(mark) { @apply bg-brand/20 text-brand font-bold rounded-sm px-0.5; }
  .no-results { @apply p-6 text-center text-muted text-xs opacity-40 italic; }
  .search-footer {
    @apply p-2 bg-white/2 border-t border-border-subtle flex gap-4 text-sm text-muted/60 font-mono;
    b { @apply text-muted; }
  }
</style>
