<script lang="ts">
    import { onMount } from "svelte";
    import { Index } from "flexsearch";
    import { goto } from "$app/navigation";
    import { Search as SearchIcon } from "lucide-svelte";

    import type { Note } from "$lib/types";

    interface SearchItem extends Note {
        tags?: string[];
        title: string;
        content?: string;
        snippetFound?: string; // Highlighting/Context snippet
    }

    let { isSidebar = false, isOpen = $bindable(false) } = $props();

    let searchTerm = $state("");
    let results = $state<SearchItem[]>([]);
    let selectedIndex = $state(0);
    let index = $state<Index | null>(null);
    let allData = $state<SearchItem[]>([]);
    let searchInput: HTMLInputElement | undefined = $state();

    export function toggleVisibility() {
        isOpen = !isOpen;
    }

    onMount(() => {
        let cleanup: (() => void) | undefined;

        const init = async () => {
            try {
                const res = await fetch("/api/search.json");
                if (!res.ok) throw new Error("Search index not found");
                allData = await res.json();

                index = new Index({
                    tokenize: "forward",
                    cache: true,
                    // Allow searching across multiple concatenated fields
                });

                allData.forEach((item, i) => {
                    const tagsStr = Array.isArray(item.tags)
                        ? item.tags.join(" ")
                        : "";
                    const searchableText = `${item.title} ${tagsStr} ${item.slug} ${item.content || ""}`;
                    index?.add(i, searchableText.toLowerCase());
                });
            } catch (err) {
                console.error("Failed to initialize search:", err);
            }

            if (!isSidebar) {
                const handleGlobalKey = (e: KeyboardEvent) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                        e.preventDefault();
                        isOpen = !isOpen;
                    }
                    if (e.key === "Escape") isOpen = false;
                };
                window.addEventListener("keydown", handleGlobalKey);
                cleanup = () =>
                    window.removeEventListener("keydown", handleGlobalKey);
            }
        };

        init();
        return () => cleanup?.();
    });

    $effect(() => {
        if (!isSidebar && isOpen) searchInput?.focus();
    });

    /**
     * Extracts a snippet of text around the found term and highlights it.
     */
    function getContextSnippet(text: string, query: string): string {
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return text.slice(0, 100) + "...";

        const start = Math.max(0, index - 40);
        const end = Math.min(text.length, index + query.length + 80);
        let snippet = text.slice(start, end);

        if (start > 0) snippet = "..." + snippet;
        if (end < text.length) snippet = snippet + "...";

        // Simple highlight (vuln to HTML in text but we cleaned it in generate-notes)
        const regex = new RegExp(`(${query})`, "gi");
        return snippet.replace(
            regex,
            '<mark class="search-highlight">$1</mark>',
        );
    }

    $effect(() => {
        if (!index || !searchTerm.trim() || searchTerm.length < 2) {
            results = [];
            return;
        }

        const query = searchTerm.toLowerCase().trim();
        const searchResults = index.search(query, { limit: 10 }) as number[];

        results = searchResults
            .map((idx) => {
                const item = { ...allData[idx] };
                if (item.content) {
                    item.snippetFound = getContextSnippet(item.content, query);
                }
                return item;
            })
            .filter(Boolean);

        selectedIndex = 0;
    });

    function handleKeydown(e: KeyboardEvent) {
        if (results.length === 0) return;
        if (e.key === "ArrowDown") {
            selectedIndex = (selectedIndex + 1) % results.length;
            e.preventDefault();
        } else if (e.key === "ArrowUp") {
            selectedIndex =
                (selectedIndex - 1 + results.length) % results.length;
            e.preventDefault();
        } else if (e.key === "Enter" && results[selectedIndex]) {
            navigate(results[selectedIndex].slug);
        }
    }

    function navigate(slug: string) {
        if (!isSidebar) isOpen = false;
        searchTerm = "";
        goto(`/${slug}`);
    }
</script>

{#if isSidebar || isOpen}
    {#if !isSidebar}
        <div
            class="search-overlay"
            onclick={() => (isOpen = false)}
            onkeydown={(e) => e.key === "Escape" && (isOpen = false)}
            role="button"
            tabindex="0"
        >
            <div
                class="search-modal"
                onclick={(e) => e.stopPropagation()}
                role="none"
            >
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
                placeholder={isSidebar ? "Buscar..." : "Busca notas o #tags..."}
                class="search-input {isSidebar ? 'text-sm' : 'text-lg'}"
            />
            {#if !isSidebar}
                <kbd class="kbd-hint">Esc</kbd>
            {/if}
        </header>

        {#if results.length > 0}
            <div
                class="results-container {isSidebar
                    ? 'max-h-[300px]'
                    : 'max-h-[60vh]'} custom-scrollbar"
            >
                {#each results as res, i}
                    <button
                        onclick={() => navigate(res.slug)}
                        class="result-item {i === selectedIndex
                            ? 'selected'
                            : ''}"
                    >
                        <div class="result-row">
                            <div class="result-main-info w-full">
                                <div
                                    class="flex justify-between items-center mb-1"
                                >
                                    <span
                                        class="result-title font-bold text-base"
                                        >{res.title}</span
                                    >
                                    <div class="tags-row">
                                        {#each res.tags || [] as tag}
                                            <span class="tag-pill">{tag}</span>
                                        {/each}
                                    </div>
                                </div>

                                {#if res.snippetFound && searchTerm.length >= 2}
                                    <p class="search-snippet">
                                        {@html res.snippetFound}
                                    </p>
                                {/if}
                            </div>
                        </div>
                    </button>
                {/each}
            </div>
        {:else if searchTerm.trim() !== ""}
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
    @reference "../../app.css";

    .search-overlay {
        @apply fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 backdrop-blur-sm bg-black/40;
    }

    .search-modal {
        @apply w-full max-w-2xl bg-background-soft border border-border-subtle rounded-xl shadow-2xl overflow-hidden;
    }

    .search-sidebar-container {
        @apply w-full border border-border-subtle rounded-lg overflow-hidden flex flex-col;
        background-color: color-mix(
            in srgb,
            var(--bg-secondary) 20%,
            transparent
        );
    }

    .search-wrapper {
        @apply flex flex-col;
    }

    .search-header {
        @apply flex items-center gap-3 p-3 border-b border-border-subtle bg-background-soft/50;
    }

    :global(.search-icon) {
        @apply text-muted;
    }

    .search-input {
        @apply flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted/40;
    }

    .kbd-hint {
        @apply px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-muted font-mono uppercase;
    }

    .results-container {
        @apply overflow-y-auto p-2;
    }

    .result-item {
        @apply w-full flex flex-col gap-0.5 p-3 rounded-md text-left transition-colors duration-150 hover:bg-white/5;
        &.selected {
            @apply bg-brand/10 text-foreground border-l-2 border-brand pl-2.5;
        }
    }

    .search-snippet {
        @apply text-[11px] leading-relaxed text-muted/60 font-mono mt-1 italic;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    :global(.search-highlight) {
        @apply bg-brand/20 text-brand font-bold rounded-sm px-0.5;
    }

    .tags-row {
        @apply flex gap-1;
    }

    .tag-pill {
        @apply px-1 py-0.5 rounded bg-white/5 text-[8px] uppercase font-mono;
    }

    .no-results {
        @apply p-6 text-center text-muted text-xs opacity-40 italic;
    }

    .search-footer {
        @apply p-2 bg-white/2 border-t border-border-subtle flex gap-4 text-[9px] text-muted/60 font-mono;
        b {
            @apply text-muted;
        }
    }
</style>
