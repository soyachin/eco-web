import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const NOTES_DIR = path.resolve('src/lib/notes');
const OUTPUT_DIR = path.resolve('src/lib/generated');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function slugify(text) {
    return text.trim().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
}

function extractWikiLinks(content) {
    const wikiStyleLinks = content.matchAll(/\[\[([^|\]\n]+)(?:\|[^\]\n]+)?\]\]/g);
    const componentStyleLinks = content.matchAll(/<WikiLink\s+path="([^"]+)"/g);

    return [
        ...[...wikiStyleLinks].map(m => m[1]),
        ...[...componentStyleLinks].map(m => m[1])
    ];
}

function generateSnippet(content, length = 200) {
    return content
        .replace(/^---[\s\S]+?---/, '')
        // Remove script and style blocks
        .replace(/<(script|style)[\s\S]*?>[\s\S]*?<\/\1>/gi, '')
        // Strip HTML/Svelte tags but keep content (e.g. <Callout>Text</Callout> -> Text)
        .replace(/<[^>]+>/g, '')
        // WikiLinks - prefer alias if available [[path|alias]] -> alias, otherwise just path
        .replace(/\[\[([^|\]\n]+)(?:\|([^\]\n]+))?\]\]/g, (match, p1, p2) => p2 || p1)
        // Remove markdown formatting
        .replace(/[#*`>_~]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, length);
}

const notes = [];
const backlinksMap = {};
const searchIndex = [];

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.md')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const { data, content: body } = matter(content);
            const slug = slugify(path.basename(file, '.md'));

            const note = {
                slug,
                meta: {
                    title: data.title || slug,
                    tags: data.tags || [],
                    date: data.date || fs.statSync(fullPath).birthtime.toISOString()
                },
                snippet: generateSnippet(body)
            };

            notes.push(note);
            searchIndex.push({
                slug,
                title: note.meta.title,
                tags: note.meta.tags
            });

            const links = extractWikiLinks(body);
            const uniqueTargets = [...new Set(links.map(link => slugify(link)))];

            uniqueTargets.forEach(target => {
                if (!backlinksMap[target]) backlinksMap[target] = [];
                backlinksMap[target].push({
                    slug,
                    meta: note.meta,
                    date: note.meta.date
                });
            });
        }
    }
}

console.log('Generating notes...');
walk(NOTES_DIR);

fs.writeFileSync(path.join(OUTPUT_DIR, 'notes.json'), JSON.stringify(notes, null, 2));
fs.writeFileSync(path.join(OUTPUT_DIR, 'search-index.json'), JSON.stringify(searchIndex, null, 2));
fs.writeFileSync(path.join(OUTPUT_DIR, 'backlinks.json'), JSON.stringify(backlinksMap, null, 2));

console.log('Done!');
