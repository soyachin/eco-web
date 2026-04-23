<script lang="ts">
    import artworks from "$lib/data/portfolio.json";
    import { fade, fly } from "svelte/transition";

    let categories = ["All", ...new Set(artworks.map((a) => a.category))];
    let activeCategory = $state("All");

    let filteredArtworks = $derived(
        activeCategory === "All"
            ? artworks
            : artworks.filter((a) => a.category === activeCategory),
    );
</script>

<svelte:head>
    <title>Portfolio | Art & Vision</title>
</svelte:head>

<div class="portfolio-container">
    <header class="portfolio-header" in:fade={{ duration: 600 }}>
        <h1 class="text-5xl font-bold text-brand mb-4 font-syne">Portafolio de Arte</h1>
        <p class="text-muted max-w-2xl text-lg font-mono italic">
            Una colección de exploraciones visuales, desde bocetos digitales hasta óleos futuristas.
        </p>
    </header>

    <nav class="filter-nav" in:fade={{ delay: 200, duration: 600 }}>
        {#each categories as category}
            <button
                class="filter-btn {activeCategory === category ? 'active' : ''}"
                onclick={() => (activeCategory = category)}
            >
                {category}
            </button>
        {/each}
    </nav>

    <div class="gallery-grid">
        {#each filteredArtworks as art (art.id)}
            <div
                class="art-card group"
                in:fly={{ y: 20, duration: 600, delay: 100 }}
                out:fade={{ duration: 300 }}
            >
                <div class="image-wrapper">
                    <img src={art.image} alt={art.title} loading="lazy" />
                    <div class="overlay">
                        <div class="overlay-content">
                            <span class="category-tag">{art.category}</span>
                            <h3 class="text-xl font-bold">{art.title}</h3>
                            <p class="text-sm opacity-80">{art.year}</p>
                            <p class="mt-2 text-xs line-clamp-2">{art.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

<style lang="postcss">
    @reference "../../app.css";

    .portfolio-container {
        @apply py-12 px-4 max-w-(--layout-max-width) mx-auto;
    }

    .portfolio-header {
        @apply mb-12 text-center flex flex-col items-center;
    }

    .filter-nav {
        @apply flex flex-wrap justify-center gap-4 mb-12;
    }

    .filter-btn {
        @apply px-4 py-1.5 rounded-full border border-border-subtle text-sm font-mono transition-all;
        @apply bg-background-soft/30 hover:bg-brand/10 hover:border-brand/50 text-muted;

        &.active {
            @apply bg-brand text-background border-brand font-bold;
        }
    }

    .gallery-grid {
        /* Masonry implementation using columns */
        column-count: 1;
        column-gap: 2rem;
    }

    @media (min-width: 640px) {
        .gallery-grid {
            column-count: 2;
        }
    }

    @media (min-width: 1024px) {
        .gallery-grid {
            column-count: 3;
        }
    }

    .art-card {
        @apply relative rounded-xl overflow-hidden border border-border-subtle shadow-lg transition-transform duration-500 mb-8;
        background-color: var(--bg-secondary);
        break-inside: avoid; /* Prevent card from breaking across columns */

        &:hover {
            @apply -translate-y-2 border-brand/40;
        }
    }

    .image-wrapper {
        @apply relative overflow-hidden;
        
        img {
            @apply w-full h-auto object-cover transition-transform duration-700;
            
            .art-card:hover & {
                @apply scale-110;
            }
        }
    }

    .overlay {
        @apply absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent;
        @apply flex items-end p-6 opacity-0 transition-opacity duration-300;
        
        .art-card:hover & {
            @apply opacity-100;
        }
    }

    .overlay-content {
        @apply text-white w-full transform translate-y-4 transition-transform duration-300;
        
        .art-card:hover & {
            @apply translate-y-0;
        }
    }

    .category-tag {
        @apply inline-block px-2 py-0.5 rounded bg-brand text-background text-[10px] font-bold uppercase mb-2;
    }
</style>
