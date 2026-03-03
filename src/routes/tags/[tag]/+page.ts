export const load = (async ({ params, parent }: any) => {
    const { notes } = await parent();
    const { tag } = params;

    // Filtrar notas por tag y por fecha
    const filteredNotes = (notes as any[])
        .filter((note) => note.meta?.tags?.includes(tag))
        .sort((a, b) => {
            const dateA = a.meta?.date ? new Date(a.meta.date).getTime() : 0;
            const dateB = b.meta?.date ? new Date(b.meta.date).getTime() : 0;
            return dateB - dateA;
        });

    return {
        tag,
        notes: filteredNotes,
    };
}) as any;
