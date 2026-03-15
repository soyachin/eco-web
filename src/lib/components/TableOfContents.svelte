<script lang="ts">
    import { onMount, tick } from "svelte";
    import { page } from "$app/state";
    import { pushState } from "$app/navigation";

    interface Heading {
        id: string;
        text: string;
        level: number;
    }

    let headings = $state<Heading[]>([]);
    let activeId = $state("");

    const slug = $derived(page.params.slug);

    async function updateHeadings() {
        await tick();
        const article = document.querySelector("article");
        if (!article) {
            headings = [];
            return;
        }

        // Include the main title (metadata title) + markdown headings
        const headingElements = Array.from(
            article.querySelectorAll("h1, h2, h3, h4"),
        );

        headings = headingElements
            .filter((el) => el.id)
            .map((el) => ({
                id: el.id,
                text: el.textContent || "",
                level: parseInt(el.tagName[1]),
            }));

        if (headings.length > 0 && !activeId) {
            activeId = headings[0].id;
        }
    }

    function handleScroll() {
        const threshold = 150; // px from top
        const headingElements = headings
            .map((h) => document.getElementById(h.id))
            .filter(Boolean) as HTMLElement[];

        let currentActive = headings[0]?.id || "";

        for (const el of headingElements) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= threshold) {
                currentActive = el.id;
            } else {
                break;
            }
        }

        activeId = currentActive;
    }

    $effect(() => {
        // Re-run on slug change
        const s = slug;
        updateHeadings();
    });

    onMount(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
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
                            const headerOffset = 80;
                            const elementPosition =
                                el.getBoundingClientRect().top;
                            const offsetPosition =
                                elementPosition +
                                window.pageYOffset -
                                headerOffset;

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: "smooth",
                            });
                        }
                        pushState(`#${heading.id}`, {});
                    }}
                >
                    {heading.text}
                </a>
            {/each}
        </nav>
    </div>
{/if}

<style lang="postcss">
    @reference "../../app.css";

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
            background: linear-gradient(
                90deg,
                color-mix(in srgb, var(--brand) 10%, transparent) 0%,
                transparent 100%
            );
        }

        &:not(.active) {
            @apply pl-2;
        }

        &.level-1 {
            @apply font-medium;
        }
        &.level-2 {
            @apply ml-0;
        }
        &.level-3 {
            @apply ml-3 text-xs;
        }
        &.level-4 {
            @apply ml-6 text-[10px];
        }
    }
</style>
