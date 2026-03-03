<script lang="ts">
    import { formatDate } from "$lib/utils";
    import type { TagPageData } from "$lib/types";

    let { data }: { data: TagPageData } = $props();
</script>

<div class="flex flex-col gap-4 mb-12">
    <div class="flex items-center gap-2 text-muted font-mono">
        <a href="/" class="hover:text-brand transition-colors">home</a>
        <span>/</span>
        <span>tags</span>
    </div>
    <h1 class="text-4xl font-bold text-brand tracking-tight">
        #{data.tag}
    </h1>
    <p class="text-muted font-mono opacity-70">
        Mostrando {data.notes.length}
        {data.notes.length === 1 ? "nota" : "notas"} con esta etiqueta.
    </p>
</div>

<ul class="flex flex-col gap-8">
    {#each data.notes as note}
        <li class="group">
            <div class="flex flex-col gap-1">
                <a href="/{note.slug}" class="block no-underline">
                    <h2
                        class="text-xl font-semibold text-foreground group-hover:text-brand transition-colors duration-200"
                    >
                        {note.meta?.title ?? note.slug}
                    </h2>
                </a>

                <div
                    class="flex items-center gap-4 font-mono text-sm text-muted"
                >
                    <span class="opacity-70">
                        {formatDate(note.meta?.date) || "??/??/????"}
                    </span>
                    <div class="flex gap-2">
                        {#each note.meta?.tags ?? [] as tag}
                            <a
                                href="/tags/{tag}"
                                class="text-muted hover:text-accent transition-colors no-underline {tag ===
                                data.tag
                                    ? 'text-brand font-bold'
                                    : ''}"
                            >
                                #{tag}
                            </a>
                        {/each}
                    </div>
                </div>
            </div>
        </li>
    {:else}
        <p class="text-muted font-mono opacity-50">
            No hay notas con esta etiqueta.
        </p>
    {/each}
</ul>
