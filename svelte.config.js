import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
    extensions: ['.md', '.svx'],
    smartypants: {
        dashes: 'oldschool'
    }
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],

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