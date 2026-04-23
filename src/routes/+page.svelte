<script lang="ts">
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import {
    formatDate,
    sortNotesByDateDesc,
    filterNotesByTag,
  } from "$lib/utils";
  import type { Note } from "$lib/types";

  let { data }: { data: { notes: Note[] } } = $props();

  let selectedTag = $derived(
    browser ? (page.url.searchParams.get("tag") ?? "todos") : "todos",
  );

  let allSortedNotes = $derived(sortNotesByDateDesc(data.notes));

  let filteredNotes = $derived(
    selectedTag === "todos"
      ? allSortedNotes.slice(0, 10)
      : filterNotesByTag(allSortedNotes, selectedTag),
  );
</script>

<h1 class="text-5xl font-syne font-bold mb-10 text-brand tracking-tight">
  {selectedTag === "todos" ? "recent notes" : `#${selectedTag}`}
</h1>

<ul class="flex flex-col gap-8">
  {#each filteredNotes as note (note.slug)}
    <li class="group">
      <div class="flex flex-col gap-1">
        <a href="/{note.slug}" class="block no-underline">
          <h2
            class="text-xl font-semibold text-foreground group-hover:text-brand transition-colors duration-200"
          >
            {note.meta?.title ?? note.slug}
          </h2>
        </a>

        <div class="flex items-center gap-4 font-mono text-sm text-muted">
          <span class="opacity-70">
            {formatDate(note.meta?.date) || "??/??/????"}
          </span>
          <div class="flex gap-2">
            {#each note.meta?.tags ?? [] as tag (tag)}
              <a
                href="/tags/{tag}"
                class="text-muted hover:text-accent transition-colors no-underline"
              >
                #{tag}
              </a>
            {/each}
          </div>
        </div>
      </div>
    </li>
  {:else}
    <p class="text-muted font-mono opacity-50">ls: no hay notas</p>
  {/each}
</ul>
