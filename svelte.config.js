import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import remarkGfm from 'remark-gfm';
import remarkWikiLink from 'remark-wiki-link';
import remarkCallouts from 'remark-callouts';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import matter from 'gray-matter';

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
    extensions: ['.md', '.svx'],
    smartypants: {
        dashes: 'oldschool'
    },
    remarkPlugins: [
        remarkGfm,
        [remarkWikiLink, {
            pathFormat: 'obsidian-short',
            hrefTemplate: (permalink) => `/${permalink}`,
            pageResolver: (name) => [name.toLowerCase().replace(/ /g, '-')],
            wikiLinkClassName: 'wikilink-internal'
        }],
        remarkCallouts
    ],
    rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }]
    ]
};

const autoImportImage = {
    markup: ({ content, filename }) => {
        if (!filename.endsWith('.md') && !filename.endsWith('.svx')) return;
        if (content.includes('<Image') && !content.includes('import Image from')) {
            const { data, content: body } = matter(content);
            const importStmt = `\n<script>\n  import Image from '$lib/components/Image.svelte';\n</script>\n`;

            // Re-stringifying with matter handles frontmatter correctly
            // We prepend the script tag to the body content
            const processed = matter.stringify(importStmt + body, data);
            return { code: processed };
        }
    }
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: [autoImportImage, vitePreprocess(), mdsvex(mdsvexOptions)],

    extensions: ['.svelte', '.md', '.svx'],

    kit: {
        // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapters for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://svelte.dev/docs/kit/adapters for more information about adapters.
        adapter: adapter(),
        alias: {
            "$lib": "./src/lib",
            "$lib/*": "./src/lib/*"
        }
    }
};

export default config;