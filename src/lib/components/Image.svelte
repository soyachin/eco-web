<script lang="ts">
    /**
     * @file Image.svelte
     * Robust flexible image component. Uses absolute positioning to ensure
     * object-fit works correctly even inside complex CSS environments like .prose.
     */
    export let src: string;
    export let alt = "";
    export let caption = "";
    export let width = "100%";
    export let height = "auto";
    export let aspectRatio = "auto";
    export let fit: "cover" | "contain" | "fill" | "scale-down" | "none" =
        "cover";
    export let position = "center";
    export let align: "left" | "center" | "right" = "center";
    export let rounded:
        | "none"
        | "sm"
        | "md"
        | "lg"
        | "xl"
        | "2xl"
        | "3xl"
        | "full" = "xl";
    export let shadow: "none" | "sm" | "md" | "lg" | "xl" | "2xl" = "md";
    export let className = "";
    export let zoom = true;

    // Loading state
    let isLoading = true;
    let hasError = false;

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

    const roundedStyles: Record<string, string> = {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        "3xl": "rounded-3xl",
        full: "rounded-full",
    };

    const shadowStyles: Record<string, string> = {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
        "2xl": "shadow-2xl",
    };
</script>

<figure
    class="not-prose my-10 flex flex-col {alignStyles[align] ||
        'items-center mx-auto'} {className}"
    style="width: {width}; max-width: 100%;"
>
    <div
        class="relative w-full overflow-hidden border border-white/10 bg-secondary/20 {roundedStyles[
            rounded
        ] || 'rounded-xl'} {shadowStyles[shadow] || 'shadow-md'} group"
        style="{height !== 'auto' ? `height: ${height};` : ''} {aspectRatio !==
        'auto'
            ? `aspect-ratio: ${aspectRatio};`
            : ''}"
    >
        <!-- Loading spinner - brand color animation -->
        {#if isLoading && !hasError}
            <div class="absolute inset-0 flex items-center justify-center z-10">
                <div class="w-8 h-8 border-3 border-brand/20 border-t-brand rounded-full animate-spin"></div>
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
            on:load={handleLoad}
            on:error={handleError}
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
