import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const { slug } = params;

    // VALIDACIÓN DE SEGURIDAD: Prevenir Path Traversal
    // Solo permitimos caracteres alfanuméricos, guiones, barras y guiones bajos.
    const safeSlugRegex = /^[a-zA-Z0-9\-_/]+$/;
    if (!safeSlugRegex.test(slug) || slug.includes('..')) {
        throw error(400, 'Nombre de nota inválido o intento de acceso no seguro.');
    }

    try {
        const post = await import(`../../lib/notes/${slug}.md`);

        return {
            content: post.default,
            meta: post.metadata
        };
    } catch (e) {
        throw error(404, `La nota "${slug}" no existe en el jardín.`);
    }
};