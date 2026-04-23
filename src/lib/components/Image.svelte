<script lang="ts">
    /**
     * @file Image.svelte
     * Robust flexible image component migrated to Svelte 5 Runes.
     */
    import { borderRadius, boxShadow, defaults } from "$lib/styles";

    let {
        src,
        alt = "",
        caption = "",
        width = "100%",
        height = "auto",
        aspectRatio = "auto",
        fit = "cover",
        position = "center",
        align = "center",
        rounded = "xl",
        shadow = "md",
        className = "",
        zoom = true,
    }: {
        src: string;
        alt?: string;
        caption?: string;
        width?: string;
        height?: string;
        aspectRatio?: string;
        fit?: "cover" | "contain" | "fill" | "scale-down" | "none";
        position?: string;
        align?: "left" | "center" | "right";
        rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
        shadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
        className?: string;
        zoom?: boolean;
    } = $props();

    // Loading state using Svelte 5 runes
    let isLoading = $state(true);
    let hasError = $state(false);

    function handleLoad() {
        isLoading = false;
    }

    function handleError() {
        isLoading = false;
        hasError = true;
    }

    const alignStyles: Record<string, string> = {
        left: "items-start ml-0 mr-auto",
        center: "items-center mx-auto",
        right: "items-end ml-auto mr-0",
    };
</script>

<figure
    class="not-prose my-10 flex flex-col {alignStyles[align] ||
        'items-center mx-auto'} {className}"
    style="width: {width}; max-width: 100%;"
>
    <div
        class="relative w-full overflow-hidden border border-white/10 bg-secondary/20 {borderRadius[rounded] ||
            defaults.rounded} {boxShadow[shadow] || defaults.shadow} group"
        style="{height !== 'auto' ? `height: ${height};` : ''} {aspectRatio !==
        'auto'
            ? `aspect-ratio: ${aspectRatio};`
            : ''}"
    >
        <!-- Loading spinner - brand color animation -->
        {#if isLoading && !hasError}
            <div class="absolute inset-0 flex items-center justify-center z-10">
                <div
                    class="w-8 h-8 border-3 border-brand/20 border-t-brand rounded-full animate-spin"
                ></div>
            </div>
        {/if}

        <img
            {src}
            {alt}
            class="block w-full m-0 p-0 transition-transform duration-700 ease-out {zoom
                ? 'group-hover:scale-110'
                : ''} {height !== 'auto' || aspectRatio !== 'auto'
                ? 'absolute inset-0 h-full'
                : 'relative h-auto'} {isLoading ? 'opacity-0' : 'opacity-100'}"
            style="object-fit: {fit}; object-position: {position};"
            loading="lazy"
            onload={handleLoad}
            onerror={handleError}
        />

        <!-- Hover overlay -->
        <div
            class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none"
        ></div>
    </div>

    {#if caption}
        <figcaption
            class="mt-3 text-center text-[11px] font-mono text-muted tracking-widest uppercase"
        >
            {caption}
        </figcaption>
    {/if}
</figure>

<style>
    /* Extra safety check to prevent figure from getting squashed */
    figure {
        min-width: 0;
    }
</style>
