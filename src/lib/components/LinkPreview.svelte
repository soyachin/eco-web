<script lang="ts">
    import { fade } from "svelte/transition";

    let { active = false, x = 0, y = 0, note = null } = $props();

    // Ajustar posición si se sale de la pantalla
    const adjustedX = $derived(
        Math.min(
            x,
            typeof window !== "undefined" ? window.innerWidth - 320 : x,
        ),
    );
</script>

{#if active && note}
    <div
        transition:fade={{ duration: 150 }}
        class="preview-card"
        style="left: {adjustedX + 10}px; top: {y + 20}px;"
    >
        <h4 class="preview-title">
            {note.meta?.title ?? note.slug}
        </h4>
        <p class="preview-snippet">
            {note.snippet ?? "Sin vista previa disponible."}
        </p>

        <div class="preview-tags">
            {#each note.meta?.tags?.slice(0, 2) ?? [] as tag}
                <span class="tag-badge">#{tag}</span>
            {/each}
        </div>
    </div>
{/if}

<style lang="postcss">
    @reference "../../app.css";
    .preview-card {
        @apply fixed z-100 w-72 p-4 rounded-xl border border-border-subtle bg-background/95 backdrop-blur-md shadow-2xl pointer-events-none;
    }

    .preview-title {
        @apply text-brand font-bold text-sm mb-2;
    }

    .preview-snippet {
        @apply text-xs text-foreground/80 leading-relaxed font-mono line-clamp-4;
    }

    .preview-tags {
        @apply mt-3 flex gap-2;
    }

    .tag-badge {
        @apply text-[10px] px-1.5 py-0.5 rounded border border-brand/30 text-brand bg-brand/5;
    }
</style>
