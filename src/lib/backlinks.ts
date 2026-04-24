/** backlinks.ts — Helper para extraer y construir el mapa de backlinks en build time.
 *  No necesita caché porque Astro construye estáticamente una sola vez. */

import { getCollection } from 'astro:content';
import { generateSnippet } from './utils';
import type { Backlink, GraphNode, GraphLink, GraphData } from './types';

/**
 * Extrae los slugs de wikilinks del estilo [[nombre]] en un string de contenido Markdown.
 * Retorna slugs normalizados (lowercase, guiones).
 */
export function extractWikiLinks(content: string): string[] {
  // 1. Wikilinks estándar: [[Link]] o [[Link|Alias]]
  const wikiStyleLinks = content.matchAll(/\[\[([^|\]\n]+)(?:\|[^\]\n]+)?\]\]/g);
  // 2. Componente WikiLink: <WikiLink path="link" />
  const componentLinks = content.matchAll(/<WikiLink\s+path="([^"]+)"/g);

  const normalize = (s: string) => s.trim().toLowerCase().replace(/ /g, '-').replace(/\.mdx?$/, '');

  return [
    ...[...wikiStyleLinks].map(m => normalize(m[1])),
    ...[...componentLinks].map(m => normalize(m[1]))
  ];
}

/**
 * Construye el mapa completo de backlinks desde todas las notas de la colección 'blog'.
 * Clave: slug de la nota destino. Valor: lista de notas que la enlazan.
 */
export async function buildBacklinksMap(): Promise<Record<string, Backlink[]>> {
  const entries = await getCollection('blog', ({ data }) => !data.draft)
  const map: Record<string, Backlink[]> = {}

  for (const entry of entries) {
    // entry.body: markdown raw sin frontmatter — disponible en type: 'content'
    const links = extractWikiLinks(entry.body ?? '')

    const sourceBacklink: Backlink = {
      slug: entry.id,
      snippet: generateSnippet(entry.body ?? ''),
      date: entry.data.date ? String(entry.data.date) : undefined,
      meta: {
        title: entry.data.title,
        tags: entry.data.tags,
        date: entry.data.date ? String(entry.data.date) : undefined,
      },
    }

    for (const targetSlug of links) {
      if (targetSlug === entry.id) continue // ignorar auto-referencias
      if (!map[targetSlug]) map[targetSlug] = []
      if (!map[targetSlug].some(b => b.slug === sourceBacklink.slug)) {
        map[targetSlug].push(sourceBacklink)
      }
    }
  }

  return map
}

/**
 * Construye nodos y links para D3 desde toda la colección.
 * - Incluye orphans (notas sin ninguna conexión)
 * - Deduplica links bidireccionales con clave canónica sorted
 * - Calcula degree de cada nodo
 */
export async function buildGraphData(): Promise<GraphData> {
  const entries = await getCollection('blog', ({ data }) => !data.draft)

  // 1. Construir links deduplicados
  const seen = new Set<string>()
  const rawLinks: { source: string; target: string }[] = []

  console.log('ENTRY SAMPLE:', entries[0]?.id, '| body length:', entries[0]?.body?.length)

  for (const entry of entries) {
    const wikilinks = extractWikiLinks(entry.body ?? '')
    for (const target of wikilinks) {
      if (target === entry.id) continue
      // Clave canónica: siempre el mismo orden independiente de dirección
      const key = [entry.id, target].sort().join('--')
      if (seen.has(key)) continue
      seen.add(key)
      rawLinks.push({ source: entry.id, target })
    }
  }

  // 2. Calcular degree de cada nodo (apariciones en links como source o target)
  const degreeMap = new Map<string, number>()
  for (const link of rawLinks) {
    degreeMap.set(link.source, (degreeMap.get(link.source) ?? 0) + 1)
    degreeMap.set(link.target, (degreeMap.get(link.target) ?? 0) + 1)
  }

  // 3. Construir nodos — todos los entries incluyendo orphans
  const nodes: GraphNode[] = entries.map(entry => ({
    id: entry.id,
    title: entry.data.title ?? entry.id,
    degree: degreeMap.get(entry.id) ?? 0,
  }))

  return { nodes, links: rawLinks as unknown as GraphLink[] }
}
