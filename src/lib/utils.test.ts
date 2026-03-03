import { describe, it, expect } from 'vitest';
import { formatDate, slugify, generateSnippet, validateSlug } from './utils';

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
});
