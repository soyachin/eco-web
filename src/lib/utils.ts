const dateCache = new Map<string, string>();

export function formatDate(date: string | number | Date | null | undefined): string {
    if (!date) return "";

    const cacheKey = String(date);
    if (dateCache.has(cacheKey)) return dateCache.get(cacheKey)!;

    let d: Date;
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        // Parse YYYY-MM-DD manually to avoid UTC shift
        const [year, month, day] = date.split("-").map(Number);
        d = new Date(year, month - 1, day);
    } else {
        d = new Date(date as any);
    }

    if (isNaN(d.getTime())) return String(date);

    const formatted = d.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    dateCache.set(cacheKey, formatted);
    return formatted;
}

/**
 * Normaliza un string para ser usado como slug: minúsculas, sin espacios (guiones) y sin caracteres especiales.
 */
export function slugify(text: string): string {
    return text.trim().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
}

/**
 * Genera un snippet limpio a partir del contenido Markdown de una nota.
 */
export function generateSnippet(content: string, length = 200): string {
    return content
        .replace(/^---[\s\S]+?---/, '') // Quitar frontmatter
        .replace(/[#*`>_~]/g, '')        // Limpiar símbolos MD básicos
        .replace(/\[\[([^|\]\n]+)(?:\|[^\]\n]+)?\]\]/g, '$1') // Limpiar wikilinks
        .replace(/<WikiLink\s+path="([^"]+)"(?:\s+alias="[^"]*")?\s*\/>/g, '$1') // Limpiar componentes WikiLink
        .replace(/\s+/g, ' ')           // Colapsar espacios
        .trim()
        .slice(0, length);
}

/**
 * Extrae los destinos de los WikiLinks (estilo [[link]] o <WikiLink />) de un contenido.
 */
export function extractWikiLinks(content: string): string[] {
    const wikiStyleLinks = content.matchAll(/\[\[([^|\]\n]+)(?:\|[^\]\n]+)?\]\]/g);
    const componentStyleLinks = content.matchAll(/<WikiLink\s+path="([^"]+)"/g);

    return [
        ...[...wikiStyleLinks].map(m => m[1]),
        ...[...componentStyleLinks].map(m => m[1])
    ];
}

import type { Note, Backlink } from "./types";

export function sortNotesByDateDesc(notes: Note[]): Note[] {
    if (!Array.isArray(notes)) return [];

    return [...notes].sort((a, b) => {
        const dateA = a.meta?.date ? new Date(a.meta.date).getTime() : 0;
        const dateB = b.meta?.date ? new Date(b.meta.date).getTime() : 0;
        return dateB - dateA;
    });
}

export function sortBacklinksWithFallback(backlinks: Backlink[]): Backlink[] {
    if (!Array.isArray(backlinks)) return [];

    return [...backlinks].sort((a, b) => {
        if (a.date && b.date) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (a.date) return -1;
        if (b.date) return 1;
        const titleA = a.meta?.title || a.slug || "";
        const titleB = b.meta?.title || b.slug || "";
        return titleA.localeCompare(titleB);
    });
}

export function findNoteBySlug(slug: string, notes: Note[]): Note | undefined {
    if (!slug || typeof slug !== "string" || !Array.isArray(notes)) return undefined;
    return notes.find((n) => n.slug === slug);
}

export function filterNotesByTag(notes: Note[], tag: string): Note[] {
    if (!Array.isArray(notes)) return [];
    if (!tag || tag === "todos") return notes;
    return notes.filter((n) => n.meta?.tags?.includes(tag) ?? false);
}

export function validateSlug(slug: string): boolean {
    if (!slug || typeof slug !== "string") return false;
    return /^[a-zA-Z0-9\-_/]+$/.test(slug) && !slug.includes("..");
}
