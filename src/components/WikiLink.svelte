<!-- WikiLink.svelte — Wikilink interno resuelto como <a> estilizado. -->
<script lang="ts">
  import { slugify } from '../lib/utils';
  let { path, alias = '' }: { path: string; alias?: string } = $props();

  const href = $derived(`/${slugify(path)}`);
  const text = $derived((alias || path).trim());
</script>

<a {href} class="wikilink-internal">{text}</a>

<style lang="postcss">
  @reference "../styles/global.css";
  .wikilink-internal {
    @apply border-b border-dashed border-brand/40 text-brand no-underline transition-all duration-200 hover:border-solid hover:border-brand hover:opacity-80;
  }
</style>
