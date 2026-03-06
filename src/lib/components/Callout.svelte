<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    type = "info",
    title = "",
    children,
  }: { type?: string; title?: string; children?: Snippet } = $props();

  import {
    Info,
    Lightbulb,
    TriangleAlert,
    Ban,
    Notebook,
    FileText,
    Calendar,
    CheckCircle2,
    HelpCircle,
    XCircle,
    Flame,
    Bug,
    BookOpen,
    Quote,
  } from "lucide-svelte";

  const cleanType = $derived(type.toLowerCase());

  const iconMap: Record<string, any> = {
    info: Info,
    tip: Lightbulb,
    warn: TriangleAlert,
    error: Ban,
    note: Notebook,
    abstract: FileText,
    todo: Calendar,
    success: CheckCircle2,
    question: HelpCircle,
    failure: XCircle,
    danger: Flame,
    bug: Bug,
    example: BookOpen,
    quote: Quote,
  };

  const IconComponent = $derived(iconMap[cleanType] || Info);
</script>

<div class="callout" data-callout={cleanType}>
  <header class="callout-header">
    <IconComponent size={18} class="callout-icon" />
    <span class="callout-title-text">{title || cleanType}</span>
  </header>
  <div class="callout-content">
    {@render children?.()}
  </div>
</div>

<style lang="postcss">
  @reference "../../app.css";
  .callout {
    @apply my-4 rounded-lg border-l-4 overflow-hidden bg-background-soft/50 border-l-brand;

    &[data-callout="info"] {
      border-left-color: var(--color-blue);
    }
    &[data-callout="tip"] {
      border-left-color: var(--color-green);
    }
    &[data-callout="warn"] {
      border-left-color: var(--color-yellow);
    }
    &[data-callout="error"] {
      border-left-color: var(--color-red);
    }
    &[data-callout="danger"] {
      border-left-color: var(--color-orange);
    }
  }

  .callout-header {
    @apply flex rounded-lg items-center gap-2 p-3 font-bold;
  }

  :global(.callout-icon) {
    @apply text-lg;
  }
  .callout-title-text {
    @apply capitalize;
  }

  .callout-content {
    @apply px-4 py-0 mb-1 text-muted;
    :global(p) {
      @apply my-2;
    }
  }
</style>
