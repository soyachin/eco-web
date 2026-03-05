import { describe, it, expect } from 'vitest';
import { formatDate, slugify, generateSnippet, validateSlug, extractWikiLinks, sortNotesByDateDesc, sortBacklinksWithFallback, findNoteBySlug, filterNotesByTag } from './utils';

describe('Utils', () => {
    describe('formatDate', () => {
        it('formats a date string correctly', () => {
            const date = '2023-10-27T12:00:00'; // Specific time to avoid TZ shifts
            expect(formatDate(date)).toContain('octubre de 2023');
        });

        it('returns empty string for null/undefined', () => {
            expect(formatDate(null)).toBe('');
            expect(formatDate(undefined)).toBe('');
        });

        it('returns original text if date is invalid', () => {
            expect(formatDate('not-a-date')).toBe('not-a-date');
        });
    });

    describe('slugify', () => {
        it('converts text to a slug', () => {
            expect(slugify('Hello World')).toBe('hello-world');
            expect(slugify('  Trim Me  ')).toBe('trim-me');
            expect(slugify('Special @#$% Characters')).toBe('special--characters');
        });
    });

    describe('generateSnippet', () => {
        it('removes markdown and frontmatter', () => {
            const content = '---\ntitle: test\n---\n# Header\nThis is a **bold** test [[link]].';
            const snippet = generateSnippet(content);
            expect(snippet).toContain('This is a bold test link');
            expect(snippet).not.toContain('---');
            expect(snippet).not.toContain('# Header');
        });
    });

    describe('validateSlug', () => {
        it('validates correct slugs', () => {
            expect(validateSlug('my-note')).toBe(true);
            expect(validateSlug('folder/my-note')).toBe(true);
        });

        it('invalidates malicious slugs', () => {
            expect(validateSlug('../etc/passwd')).toBe(false);
            expect(validateSlug('')).toBe(false);
        });
    });

    describe('extractWikiLinks', () => {
        it('extracts links from both styles', () => {
            const content = 'Check [[link1]] and <WikiLink path="link2" /> and nested [[path/to/link3|Alias]].';
            const links = extractWikiLinks(content);
            // order: wikiStyleLinks first, then componentStyleLinks
            expect(links).toEqual(['link1', 'path/to/link3', 'link2']);
        });

        it('returns empty array if no links found', () => {
            expect(extractWikiLinks('No links here')).toEqual([]);
        });
    });

    describe('sortNotesByDateDesc', () => {
        it('sorts notes by date descending', () => {
            const notes: any[] = [
                { slug: 'a', meta: { date: '2023-01-01' } },
                { slug: 'b', meta: { date: '2023-01-02' } },
                { slug: 'c', meta: {} }
            ];
            const sorted = sortNotesByDateDesc(notes);
            expect(sorted[0].slug).toBe('b');
            expect(sorted[1].slug).toBe('a');
            expect(sorted[2].slug).toBe('c');
        });
    });

    describe('sortBacklinksWithFallback', () => {
        it('sorts by date then by title', () => {
            const backlinks: any[] = [
                { slug: 'no-date', meta: { title: 'Z' } },
                { slug: 'old', date: '2022-01-01', meta: { title: 'A' } },
                { slug: 'new', date: '2023-01-01', meta: { title: 'B' } }
            ];
            const sorted = sortBacklinksWithFallback(backlinks);
            expect(sorted[0].slug).toBe('new');
            expect(sorted[1].slug).toBe('old');
            expect(sorted[2].slug).toBe('no-date');
        });
    });

    describe('findNoteBySlug', () => {
        it('finds note by slug', () => {
            const notes: any[] = [{ slug: 'test' }, { slug: 'other' }];
            expect(findNoteBySlug('test', notes)).toEqual({ slug: 'test' });
            expect(findNoteBySlug('none', notes)).toBeUndefined();
        });
    });

    describe('filterNotesByTag', () => {
        it('filters correctly', () => {
            const notes: any[] = [
                { meta: { tags: ['dev'] } },
                { meta: { tags: ['life'] } },
                { meta: {} }
            ];
            expect(filterNotesByTag(notes, 'dev')).toHaveLength(1);
            expect(filterNotesByTag(notes, 'todos')).toHaveLength(3);
        });
    });
});
