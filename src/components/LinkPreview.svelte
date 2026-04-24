<!-- LinkPreview.svelte — Preview flotante al hacer hover en enlaces internos.
     En Astro, recibe los datos de notas y escucha eventos custom desde el layout.
     El layout dispara 'link-preview-show' y 'link-preview-hide'. -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import type { Note } from '../lib/types';

  /** Datos de todas las notas para buscar el slug del link hovered */
  let { notes = [] as Note[] }: { notes?: Note[] } = $props();

  let active = $state(false);
  let x = $state(0);
  let y = $state(0);
  let note = $state<Note | null>(null);

  const adjustedX = $derived(
    Math.min(x, typeof window !== 'undefined' ? window.innerWidth - 320 : x)
  );

  onMount(() => {
    const onShow = (e: Event) => {
      const { slug, x: ex, y: ey } = (e as CustomEvent).detail;
      const found = notes.find(n => n.slug === slug);
      if (found) {
        x = ex; y = ey;
        note = found;
        active = true;
      }
    };
    const onHide = () => { active = false; note = null; };

    window.addEventListener('link-preview-show', onShow);
    window.addEventListener('link-preview-hide', onHide);
    return () => {
      window.removeEventListener('link-preview-show', onShow);
      window.removeEventListener('link-preview-hide', onHide);
    };
  });
</script>

{#if active && note}
  <div
    transition:fade={{ duration: 150 }}
    class="preview-card"
    style="left: {adjustedX + 10}px; top: {y + 20}px;"
  >
    <h4 class="preview-title">{note.meta?.title ?? note.slug}</h4>
    <p class="preview-snippet">{note.snippet ?? 'Sin vista previa disponible.'}</p>
    <div class="preview-tags">
      {#each note.meta?.tags?.slice(0, 2) ?? [] as tag}
        <span class="tag-badge">#{tag}</span>
      {/each}
    </div>
  </div>
{/if}

<style lang="postcss">
  @reference "../styles/global.css";
  .preview-card {
    @apply fixed z-[100] w-72 p-4 rounded-xl border border-border-subtle bg-background/95 backdrop-blur-md shadow-2xl pointer-events-none;
  }
  .preview-title { @apply text-brand font-bold text-sm mb-2; }
  .preview-snippet { @apply text-xs text-foreground/80 leading-relaxed font-mono line-clamp-4; }
  .preview-tags { @apply mt-3 flex gap-2; }
  .tag-badge { @apply text-[10px] px-1.5 py-0.5 rounded border border-brand/30 text-brand bg-brand/5; }
</style>
