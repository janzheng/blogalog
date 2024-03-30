// import adapter from '@sveltejs/adapter-auto'
// import adapter_static from '@sveltejs/adapter-static'
import adapter_vercel from '@sveltejs/adapter-vercel'
// import adapter_static from '@sveltejs/adapter-static'
// import adapter_node from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

import { mdsvex } from 'mdsvex'
// import remarkAttr from 'remark-attr'
// import rehypeSlug from 'rehype-slug'
// import autoprefixer from 'autoprefixer'

// import { plugin as markdown, Mode } from "vite-plugin-markdown";
// import preprocessMarkdoc from 'svelte-markdoc'
// import markdocConfig from './markdoc.config.js'


import { config as dotenvconf } from "dotenv"
dotenvconf() 

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx'], // adding .md here screws up vite meta glob import
  preprocess: [
    mdsvex({
      extensions: ['.svx'],
    }),
    // vitePreprocess({
    //   postcss: true,
    // }), // this breaks mdsvex w/ custom tailwinds!
    preprocess({
      postcss: true,
    }),
  ],


  // vercel; regular deployment
  kit: {
    // adapter: adapter_auto(),
    adapter: adapter_vercel({
      // runtime: 'edge'
    }),
    // adapter: adapter_static(),
    // adapter: adapter_node(),

    // used for static, to generate a bunch of pages
    // adapter: adapter_static(),
    // prerender: {
    //   crawl: false,
    //   enabled: false,
    //   // pages: // generate an array of pages
    //   // entries: [
    //   //   // "/blog/slug/one-one",
    //   //   // "/blog/slug/two-two",
    //   //   "*"
    //   // ]
    // },
  },
};

export default config;

