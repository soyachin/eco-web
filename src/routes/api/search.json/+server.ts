import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    // the static notes.json already contains the metadata we need for search;
    // it is regenerated at build time by the `generate-notes` script.
    const module = await import('$lib/generated/search-index.json');
    const searchIndex = module.default || [];

    return json(searchIndex);
};
