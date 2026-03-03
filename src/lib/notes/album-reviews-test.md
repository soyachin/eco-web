---
title: "descubrimientos musicales"
date: 2026-02-28
tags: ["music", "test"]
---

<script>
  import AlbumReview from '$lib/components/AlbumReview.svelte';
  import Callout from '$lib/components/Callout.svelte';
  import WikiLink from '$lib/components/WikiLink.svelte';
</script>


Welcome to my monthly music review. This page uses **Svelte Components** directly for maximum stability.

<Callout type="info" title="Methodology">
  Each album is rated on a scale of 1 to 5 stars. I listen to each at least three times before writing.
</Callout>

## The Highlights

<AlbumReview 
  artist="Pink Floyd" 
  album="The Dark Side of the Moon" 
  cover="https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png" 
  rating={5} 
/>

Check out my <WikiLink path="index" alias="Home Page" /> for more reviews!

## Direct Component Usage

As you requested, we use components **directly** without any hidden transformations:

<Callout type="warn" title="Direct Component Test">
  This callout was written using component tags directly in the Markdown file!
</Callout>

And here is a direct link: <WikiLink path="index" alias="Regresar al Inicio" />
