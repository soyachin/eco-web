<script lang="ts">
  import { page } from "$app/state";
  import { formatDate, sortBacklinksWithFallback } from "$lib/utils";
  import type { NoteMeta, LayoutData } from "$lib/types";
  import type { Component } from "svelte";

  let {
    data,
  }: {
    data: LayoutData & {
      content: Component;
      meta: NoteMeta;
    };
  } = $props();

  const currentSlug = $derived(page.params.slug ?? "");
  const BACKLINKS_LIMIT = 6;
  let showAllBacklinks = $state(false);

  let backlinks = $derived(
    sortBacklinksWithFallback(data.backlinksMap?.[currentSlug] ?? []),
  );

  let visibleBacklinks = $derived(
    showAllBacklinks ? backlinks : backlinks.slice(0, BACKLINKS_LIMIT),
  );
</script>

<article class="prose">
  <header class="not-prose border-b border-border-subtle/10 text-left pb-2">
    <h1
      id="title"
      class="text-5xl font-bold text-brand mb-4 leading-none gap-2"
    >
      {data.meta?.title ?? currentSlug}
    </h1>

    <div class="flex flex-col items-start gap-2 font-mono text-base text-muted">
      {#if data.meta?.date}
        <span class="opacity-70">{formatDate(data.meta.date)}</span>
      {/if}

      <div class="flex flex-wrap justify-start gap-4">
        {#each data.meta?.tags ?? [] as tag}
          <a
            href="/tags/{tag}"
            class="text-muted hover:text-brand transition-colors no-underline"
          >
            #{tag}
          </a>
        {/each}
      </div>
    </div>
  </header>

  <div class="content-wrapper">
    {#if data.content}
      <data.content />
    {/if}
  </div>
</article>
