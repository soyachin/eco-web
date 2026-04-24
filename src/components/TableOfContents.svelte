<!-- TableOfContents.svelte — Tabla de contenidos con resaltado por scroll.
     Extrae los headings del <article> en el DOM y los rastrea con IntersectionObserver. -->
<script lang="ts">
  import { onMount, tick } from 'svelte';

  interface Heading {
    id: string;
    text: string;
    level: number;
  }

  // El slug de la nota actual se recibe como prop desde el layout Astro
  let { slug = '' }: { slug?: string } = $props();

  let headings = $state<Heading[]>([]);
  let activeId = $state('');

  async function updateHeadings() {
    await tick();
    const article = document.querySelector('article');
    if (!article) { headings = []; return; }

    const elements = Array.from(article.querySelectorAll('h1, h2, h3, h4'));
    headings = elements
      .filter(el => el.id)
      .map(el => ({
        id: el.id,
        text: el.textContent || '',
        level: parseInt(el.tagName[1]),
      }));

    if (headings.length > 0 && !activeId) {
      activeId = headings[0].id;
    }
  }

  function handleScroll() {
    const threshold = 150;
    const els = headings
      .map(h => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    let current = headings[0]?.id || '';
    for (const el of els) {
      if (el.getBoundingClientRect().top <= threshold) current = el.id;
      else break;
    }
    activeId = current;
  }

  // Actualizar headings cuando cambia la nota
  $effect(() => {
    const _ = slug;
    updateHeadings();
  });

  onMount(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

{#if headings.length > 1}
  <div class="toc-container">
    <h3 class="toc-title">En esta página</h3>
    <nav class="toc-nav custom-scrollbar">
      {#each headings as heading}
        <a
          href="#{heading.id}"
          class="toc-link level-{heading.level}"
          class:active={activeId === heading.id}
          onclick={(e) => {
            e.preventDefault();
            const el = document.getElementById(heading.id);
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY - 80;
              window.scrollTo({ top, behavior: 'smooth' });
            }
            history.pushState(null, '', `#${heading.id}`);
          }}
        >
          {heading.text}
        </a>
      {/each}
    </nav>
  </div>
{/if}

<style lang="postcss">
  @reference "../styles/global.css";

  .toc-container {
    @apply mt-8 flex flex-col gap-3;
  }
  .toc-title {
    @apply text-[12px] font-mono text-muted uppercase tracking-widest mb-1;
  }
  .toc-nav {
    @apply flex flex-col gap-1 max-h-[40vh] overflow-y-auto pr-2;
  }
  .toc-link {
    @apply text-sm text-muted/60 transition-all duration-200 hover:text-brand border-l-2 border-transparent py-0.5;
    &.active {
      @apply text-brand border-brand font-medium pl-3;
      background: linear-gradient(90deg, color-mix(in srgb, var(--brand-primary) 10%, transparent) 0%, transparent 100%);
    }
    &:not(.active) { @apply pl-2; }
    &.level-1 { @apply font-medium; }
    &.level-2 { @apply ml-0; }
    &.level-3 { @apply ml-3 text-xs; }
    &.level-4 { @apply ml-6 text-[10px]; }
  }
</style>
