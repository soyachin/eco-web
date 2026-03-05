<script lang="ts">
  import "../app.css";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import LinkPreview from "$lib/components/LinkPreview.svelte";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { sortBacklinksWithFallback } from "$lib/utils";
  import type { PreviewState, LayoutData } from "$lib/types";

  let GraphView = $state<any>(null);
  let Search = $state<any>(null);

  onMount(async () => {
    const [gv, s] = await Promise.all([
      import("$lib/components/GraphView.svelte"),
      import("$lib/components/Search.svelte"),
    ]);
    GraphView = gv.default;
    Search = s.default;
  });

  let { data, children }: { data: LayoutData; children: any } = $props();

  // --- LinkPreview Logic ---
  let preview = $state<PreviewState>({
    active: false,
    x: 0,
    y: 0,
    note: null,
  });
  let previewTimer: any;

  function handleMouseOver(e: MouseEvent) {
    const target = (e.target as HTMLElement).closest("a");
    const href = target?.getAttribute("href");

    if (href?.startsWith("/") && href.length > 1) {
      const slug = href.slice(1).split(/[?#]/)[0];
      const note = data.notes.find((n) => n.slug === slug);

      if (note) {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(() => {
          preview = { active: true, x: e.clientX, y: e.clientY, note };
        }, 300);
      }
    }
  }

  function handleMouseOut() {
    clearTimeout(previewTimer);
    preview.active = false;
  }

  const currentSlug = $derived(page.params.slug ?? "");
  const graphLinks = $derived(
    Object.entries(data.backlinksMap || {}).flatMap(
      ([target, sources]: [string, any]) =>
        sources.map((s: any) => ({ source: s.slug, target })),
    ),
  );

  const isHomePage = $derived(page.url.pathname === "/");
  const isMdNotePage = $derived(!!page.data?.content);
  const shouldShowExplorer = $derived(isMdNotePage || isHomePage);
  const shouldShowGraphAndBacklinks = $derived(
    (currentSlug && data.notes.some((n) => n.slug === currentSlug)) ||
      isHomePage,
  );

  const backlinks = $derived.by(() => {
    if (isHomePage) return [];
    const raw = data.backlinksMap?.[currentSlug] ?? [];
    return sortBacklinksWithFallback(raw).slice(0, 10);
  });

  let isSearchOpen = $state(false);
  
  // Asegurar que el contenido esté siempre centrado
  onMount(() => {
    // Aplicar estilos críticos para responsive
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 1024px) {
        .content-area {
          grid-column: 1 / -1 !important;
          max-width: 100% !important;
        }
        .content-wrapper {
          margin: 0 auto !important;
          max-width: min(100% - 2rem, 800px) !important;
        }
      }
    `;
    document.head.appendChild(style);
  });
</script>

<svelte:window on:mouseover={handleMouseOver} on:mouseout={handleMouseOut} />

<nav class="navbar">
  <div class="navbar-container">
    <a href="/" class="logo">
      <span>~/ecomecanico</span>
    </a>

    <div class="nav-links">
      <button
        class="nav-item lg:hidden p-2 -mr-2"
        onclick={() => (isSearchOpen = true)}
        aria-label="Search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-search"
          ><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
        >
      </button>
      <a href="/about" class="nav-item hidden sm:inline-block">whoami</a>
      <ThemeToggle />
    </div>
  </div>
</nav>

<main class="main-layout">
  <div class="grid-container">
    <!-- Columna Izquierda: Explorador (Hidden on Mobile) -->
    <aside class="sidebar sidebar-left">
      {#if shouldShowExplorer}
        <div class="sticky-sidebar">
          <h3 class="sidebar-title">Explorar</h3>
          {#if Search}
            <Search isSidebar={true} />
          {/if}
          <div class="sidebar-hint">
            También puedes usar <span class="highlight">Ctrl + K</span>.
          </div>
        </div>
      {/if}
    </aside>

    <!-- Centro: Contenido Principal -->
    <div class="content-area">
      <div class="content-wrapper">
        {@render children()}
      </div>

      <!-- Mobile-only section for Backlinks (No Graph) -->
      <div class="mobile-complement lg:hidden mt-12 space-y-8">
        {#if shouldShowGraphAndBacklinks}
          {@render sideContent(true)}
        {/if}
      </div>
    </div>

    <!-- Columna Derecha: Grafo y Backlinks (Desktop) -->
    <aside class="sidebar sidebar-right">
      <div class="sticky-sidebar">
        {#if shouldShowGraphAndBacklinks}
          {@render sideContent(false)}
        {/if}
      </div>
    </aside>
  </div>
</main>

{#snippet sideContent(isMobile: boolean)}
  <div class="flex flex-col gap-8">
    <!-- Grafo (Hidden on Mobile as requested) -->
    {#if !isMobile}
      <section class="card">
        <h3 class="card-title">
          {isHomePage ? "Jardín" : "Interconexiones"}
        </h3>
        <div class="graph-wrapper">
          {#if GraphView}
            <GraphView
              nodes={data.notes}
              links={graphLinks}
              currentSlug={isHomePage ? "" : currentSlug}
              isGlobal={isHomePage}
            />
          {/if}
        </div>
      </section>
    {/if}

    <!-- Backlinks -->
    {#if !isHomePage && backlinks.length > 0}
      <section class="card overflow-hidden">
        <h3 class="card-title">Enlazado en</h3>
        <ul class="backlinks-list custom-scrollbar">
          {#each backlinks as backlink}
            <li>
              <a href="/{backlink.slug}" class="backlink-item group">
                <span class="backlink-text"
                  >{backlink.meta?.title ?? backlink.slug}</span
                >
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  </div>
{/snippet}

<LinkPreview
  active={preview.active}
  x={preview.x}
  y={preview.y}
  note={preview.note}
/>

{#if Search}
  <Search bind:isOpen={isSearchOpen} />
{/if}

<style lang="postcss">
  @reference "../app.css";

  :global(html) {
    scroll-behavior: smooth;
    overflow-y: scroll;
    background-color: var(--bg-primary);
  }

  .navbar {
    @apply sticky top-0 z-40 w-full border-b border-border-subtle bg-background/70 backdrop-blur-md;
  }

  .navbar-container {
    @apply mx-auto flex max-w-(--layout-max-width) items-center justify-between px-6 h-(--nav-height);
  }

  .logo {
    @apply flex items-center gap-2 font-mono font-bold text-brand transition-colors hover:text-brand-muted text-xl;
  }

  .nav-links {
    @apply flex items-center gap-6 font-mono text-muted;
  }

  .nav-item {
    @apply hover:text-foreground transition-colors;
  }

  .main-layout {
    @apply mx-auto max-w-(--layout-max-width) px-4 sm:px-6;
  }

  .grid-container {
    @apply grid grid-cols-1 lg:grid-cols-[var(--sidebar-width)_1fr_var(--sidebar-width)] gap-8 xl:gap-12;
  }

  .sidebar {
    @apply hidden lg:block py-(--page-top-margin);
  }

  .sticky-sidebar {
    @apply sticky top-[calc(var(--nav-height)+2rem)];
  }

  .sidebar-title {
    @apply text-[13px] font-mono text-muted uppercase tracking-widest mb-4;
  }

  .sidebar-hint {
    @apply mt-4 text-[13px] font-mono text-muted leading-relaxed italic;
    .highlight {
      @apply text-brand/80;
    }
  }

  .content-area {
    @apply min-w-0 py-(--page-top-margin) pb-12;
  }

  .content-wrapper {
    @apply mx-auto max-w-(--main-content-max-width);
  }

  .card {
    @apply rounded-xl border p-4;
    background-color: color-mix(in srgb, var(--bg-secondary) 20%, transparent);
    border-color: color-mix(in srgb, var(--bg-tertiary), transparent);
  }

  .card-title {
    @apply text-[12px] font-mono text-muted uppercase tracking-widest mb-3 border-b border-border-subtle pb-2;
  }

  .graph-wrapper {
    @apply h-[250px] w-full overflow-hidden;
  }

  .backlinks-list {
    @apply flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 text-left;
  }

  .backlink-item {
    @apply block no-underline;
  }

  .backlink-text {
    @apply text-sm font-medium text-foreground transition-colors block truncate;
    .backlink-item:hover & {
      @apply text-brand;
    }
  }
</style>
