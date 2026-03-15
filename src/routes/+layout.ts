// src/routes/+layout.ts
export const prerender = true;
export const trailingSlash = 'never';
import type { LayoutLoad } from './$types';
// before we precomputed notes dynamically; now we rely on the generated JSON
// files which are produced by `npm run generate` during build.
import notes from '$lib/generated/notes.json';
import backlinksMap from '$lib/generated/backlinks.json';

export const load: LayoutLoad = async () => {
    // Obtenemos metadatos y contenido raw para los backlinks y snippets
    // `notes` and `backlinksMap` are imported as static JSON; no async work.
    return { notes, backlinksMap };
};