<script lang="ts">
  import "../app.css";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import LinkPreview from "$lib/components/LinkPreview.svelte";
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { sortBacklinksWithFallback } from "$lib/utils";
  import type { PreviewState, LayoutData } from "$lib/types";
  import type { Component } from "svelte";
  import { onMount, onDestroy } from "svelte";

  // Estado para controlar flashing
  let isHydrated = $state(false);

  // Establecer tema oscuro como default
  $effect(() => {
    if (typeof document !== "undefined") {
      const theme = localStorage.getItem("theme") || "dark";
      document.documentElement.setAttribute("data-theme", theme);
    }
  });

  onMount(() => {
    isHydrated = true;
  });

  let GraphView = $state<Component<any> | null>(null);
  let Search = $state<Component<any> | null>(null);
  let TableOfContents = $state<Component<any> | null>(null);

  onMount(async () => {
    // Cargar componentes dinámicamente
    const [gv, s, toc] = await Promise.all([
      import("$lib/components/GraphView.svelte"),
      import("$lib/components/Search.svelte"),
      import("$lib/components/TableOfContents.svelte"),
    ]);
    GraphView = gv.default;
    Search = s.default;
    TableOfContents = toc.default;
  });

  let {
    data,
    children,
  }: { data: LayoutData; children: import("svelte").Snippet } = $props();

  // --- LinkPreview Logic ---
  let preview = $state<PreviewState>({
    active: false,
    x: 0,
    y: 0,
    note: null,
  });
  let previewTimer: ReturnType<typeof setTimeout>;

  onDestroy(() => {
    clearTimeout(previewTimer);
  });

  function handleMouseOver(e: MouseEvent | FocusEvent) {
    const target = (e.target as HTMLElement).closest("a");
    if (!target) return;

    const href = target.getAttribute("href");

    if (href?.startsWith("/") && href.length > 1) {
      const slug = href.slice(1).split(/[?#]/)[0];
      const note = data.notes.find(
        (n: import("$lib/types").Note) => n.slug === slug,
      );

      if (note) {
        clearTimeout(previewTimer);
        const x = "clientX" in e ? (e as MouseEvent).clientX : 0;
        const y = "clientY" in e ? (e as MouseEvent).clientY : 0;
        previewTimer = setTimeout(() => {
          preview = { active: true, x, y, note };
        }, 300);
      }
    }
  }

  function handleMouseOut(e: MouseEvent | FocusEvent) {
    const target = (e.target as HTMLElement).closest("a");
    if (target) {
      clearTimeout(previewTimer);
      preview.active = false;
    }
  }

  const currentSlug = $derived(page.params.slug ?? "");
  
  // Cache the processed graph links to avoid flatmapping every time
  const graphLinks = $derived.by(() => {
    if (!data.backlinksMap) return [];
    return Object.entries(data.backlinksMap).flatMap(([target, sources]) =>
      sources.map((s) => ({ source: s.slug, target })),
    );
  });

  const isHomePage = $derived(page.url.pathname === "/");
  const isMdNotePage = $derived(!!page.data?.content);
  const shouldShowExplorer = $derived(isMdNotePage || isHomePage);
  const shouldShowGraphAndBacklinks = $derived(
    (currentSlug &&
      data.notes.some(
        (n: import("$lib/types").Note) => n.slug === currentSlug,
      )) ||
      isHomePage,
  );

  const backlinks = $derived.by(() => {
    if (isHomePage) return [];
    const raw = data.backlinksMap?.[currentSlug] ?? [];
    return sortBacklinksWithFallback(raw).slice(0, 10);
  });

  let isSearchOpen = $state(false);
</script>



<div
  class="layout-container {isHydrated ? 'opacity-100' : 'opacity-0'}"
  onmouseover={handleMouseOver}
  onmouseout={handleMouseOut}
  onfocusin={handleMouseOver}
  onfocusout={handleMouseOut}
  role="presentation"
>
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
        <a href="/portfolio" class="nav-item text-sm hidden sm:inline-block"
          >portafolio</a
        >
        <a href="/graph" class="nav-item text-sm hidden sm:inline-block"
          >mapa</a
        >
        <a href="/about" class="nav-item text-sm hidden sm:inline-block"
          >whoami</a
        >
        <ThemeToggle />
      </div>
    </div>
  </nav>

  <main class="main-layout">
    <div class="grid-container {!shouldShowExplorer && !shouldShowGraphAndBacklinks ? 'full-width' : ''}">
      <!-- Columna Izquierda: Explorador (Hidden on Mobile) -->
      {#if shouldShowExplorer}
        <aside class="sidebar sidebar-left">
          <div class="sticky-sidebar">
            <h3 class="sidebar-title">Explorar</h3>
            {#if Search}
              <Search isSidebar={true} />
            {/if}
            <div class="sidebar-hint">
              También puedes usar <span class="highlight">Ctrl + K</span>.
            </div>

            {#if TableOfContents && isMdNotePage}
              <TableOfContents />
            {/if}
          </div>
        </aside>
      {/if}

      <!-- Centro: Contenido Principal -->
      <div class="content-area">
        <div class="content-wrapper {isMdNotePage ? 'is-note' : 'is-wide'}">
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
      {#if shouldShowGraphAndBacklinks}
        <aside class="sidebar sidebar-right">
          <div class="sticky-sidebar">
            {@render sideContent(false)}
          </div>
        </aside>
      {/if}
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
</div>

<style lang="postcss">
  @reference "../app.css";

  :global(html) {
    scroll-behavior: smooth;
    overflow-y: scroll;
    background-color: var(--bg-primary);
  }

  /* Unificar fondos Gruvbox para evitar franjas */
  :global(body),
  .navbar,
  .main-layout,
  .content-area,
  .grid-container {
    background-color: var(--bg-primary) !important;
  }

  .navbar {
    @apply sticky top-0 z-40 w-full border-b border-border-subtle backdrop-blur-md;
    background-color: var(--bg-primary) !important;
  }

  .navbar-container {
    @apply mx-auto flex max-w-(--layout-max-width) items-center justify-between px-6 h-(--nav-height);
  }

  .logo {
    @apply flex items-center gap-2 font-syne font-bold text-brand transition-colors hover:text-brand-muted text-2xl;
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
    
    &.full-width {
      grid-template-columns: 1fr !important;
    }
  }

  .sidebar {
    @apply hidden lg:block py-(--page-top-margin);
  }

  .sticky-sidebar {
    @apply sticky top-[calc(var(--nav-height)+2rem)];
  }

  .sidebar-title {
    @apply text-sm font-mono text-muted uppercase tracking-widest mb-4;
  }

  .sidebar-hint {
    @apply mt-4 text-sm font-mono text-muted leading-relaxed italic;
    .highlight {
      @apply text-brand/80;
    }
  }

  .content-area {
    @apply min-w-0 py-(--page-top-margin) pb-12;
  }

  .content-wrapper {
    @apply mx-auto w-full transition-all duration-300;
    max-width: var(--layout-max-width);
  }

  .content-wrapper.is-note {
    max-width: var(--main-content-max-width);
  }

  .card {
    @apply rounded-xl border p-4;
    background-color: color-mix(in srgb, var(--bg-primary) 10%, transparent);
    border-color: color-mix(in srgb, var(--bg-primary) 30%, transparent);
  }

  .card-title {
    @apply text-[11px] font-mono text-muted uppercase tracking-widest mb-3 border-b border-border-subtle pb-2;
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
