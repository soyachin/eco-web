import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { wikiLinkPlugin as remarkWikiLink } from 'remark-wiki-link';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import EventEmitter from 'node:events';
EventEmitter.defaultMaxListeners = 20;

export default defineConfig({
  site: 'https://blog.nyarkovchains.site',
  typescript: {check: false},

  integrations: [
    svelte(),
    mdx(),
  ],

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },

  markdown: {
    remarkPlugins: [
      remarkGfm,
      [remarkWikiLink, {
        pathFormat: 'obsidian-short',
        pageResolver: (name: string) => [name.toLowerCase().replace(/ /g, '-')],
        hrefTemplate: (permalink: string) => `/${permalink}`,
        wikiLinkClassName: 'wikilink-internal',
      }],
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },

  output: 'static',
});
