import type { TagPageData, Note } from "$lib/types";
import { sortNotesByDateDesc } from "$lib/utils";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, parent }) => {
    const { notes } = await parent();
    const { tag } = params;

    // Filtrar notas por tag y usar el utility de ordenamiento
    const taggedNotes = (notes as Note[]).filter((note) => note.meta?.tags?.includes(tag));
    const filteredNotes = sortNotesByDateDesc(taggedNotes);

    return {
        tag,
        notes: filteredNotes,
    } as TagPageData;
};
