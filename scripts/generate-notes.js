import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import matter from 'gray-matter';

const NOTES_DIR = path.resolve('src/lib/notes');
const OUTPUT_DIR = path.resolve('src/lib/generated');
const CACHE_FILE = path.join(OUTPUT_DIR, '.notes-cache.json');

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
        .replace(/<(script|style)[\s\S]*?>[\s\S]*?<\/\1>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\[\[([^|\]\n]+)(?:\|([^\]\n]+))?\]\]/g, (match, p1, p2) => p2 || p1)
        .replace(/[#*`>_~]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, length);
}

function getHash(content) {
    return crypto.createHash('md5').update(content).digest('hex');
}

// Load cache
let cache = { files: {}, version: '1.1' };
if (fs.existsSync(CACHE_FILE)) {
    try {
        cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } catch (e) {
        console.warn('Cache corrupted, starting fresh');
    }
}

const newCacheFiles = {};

function processFile(fullPath, relPath) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const hash = getHash(content);
    const fileName = path.basename(fullPath);

    // Check if file is in cache and has not changed (by hash)
    if (cache.files[relPath] && cache.files[relPath].hash === hash) {
        newCacheFiles[relPath] = cache.files[relPath];
        return;
    }

    console.log(`Processing: ${relPath}`);
    const { data, content: body } = matter(content);
    const stats = fs.statSync(fullPath);
    const slug = slugify(path.basename(fileName, '.md'));

    const processedData = {
        hash,
        slug,
        meta: {
            title: data.title || slug,
            tags: data.tags || [],
            date: data.date || stats.birthtime.toISOString()
        },
        snippet: generateSnippet(body),
        links: extractWikiLinks(body)
    };

    newCacheFiles[relPath] = processedData;
}

function walk(dir, relDir = '') {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const relPath = path.join(relDir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, relPath);
        } else if (file.endsWith('.md')) {
            processFile(fullPath, relPath);
        }
    }
}

console.log('Syncing notes... ');
walk(NOTES_DIR);

// Update cache
cache.files = newCacheFiles;
fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

// Reconstruct final outputs from cache
const notes = [];
const backlinksMap = {};
const searchIndex = [];

const sortedFilePaths = Object.keys(cache.files).sort();

for (const relPath of sortedFilePaths) {
    const data = cache.files[relPath];
    const { slug, meta, snippet, links } = data;

    notes.push({ slug, meta, snippet });
    searchIndex.push({
        slug,
        title: meta.title,
        tags: meta.tags
    });

    const uniqueTargets = [...new Set(links.map(link => slugify(link)))];
    uniqueTargets.forEach(target => {
        if (!backlinksMap[target]) backlinksMap[target] = [];
        backlinksMap[target].push({
            slug,
            meta,
            date: meta.date
        });
    });
}

fs.writeFileSync(path.join(OUTPUT_DIR, 'notes.json'), JSON.stringify(notes, null, 2));
fs.writeFileSync(path.join(OUTPUT_DIR, 'search-index.json'), JSON.stringify(searchIndex, null, 2));
fs.writeFileSync(path.join(OUTPUT_DIR, 'backlinks.json'), JSON.stringify(backlinksMap, null, 2));

console.log(`Done! Synced ${Object.keys(newCacheFiles).length} files.`);


