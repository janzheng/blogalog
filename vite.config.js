
import path from 'path'
import { sveltekit } from "@sveltejs/kit/vite";
// import { plugin as markdown, Mode } from "vite-plugin-markdown";

import { config as dotenvconf } from "dotenv"
dotenvconf()


console.log('Use Local?:', process.env.PUBLIC_LOCAL)

/** @type {import("vite").UserConfig} */
const config = {
  plugins: [
    sveltekit({
      extensions: ['.svelte'],
    }),
  ],
  ssr: {
    // noExternal: ['prismjs', 'prism-svelte'],
  },
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       additionalData: "@use \"src/app.scss\" as *;"
  //     }
  //   }
  // },
  resolve: {
    alias: {
      // these are the aliases and paths to them
      $src: path.resolve('./src'),
      $routes: path.resolve('./src/routes'),
      $instill: path.resolve('./src/routes/instill'),

      
      $plasmid: process.env.PUBLIC_LOCAL == 'local' ? path.resolve('./src/plasmid') : path.resolve('./node_modules/plasmid'), // dynamic linked
      // $plasmid: path.resolve('./src/plasmid'), // local linked
      // $plasmid: path.resolve('./node_modules/plasmid'), // git linked

      '$instill-helpers': process.env.PUBLIC_LOCAL == 'local' ? path.resolve('./src/plasmid/modules/instill-helpers') : path.resolve('./node_modules/plasmid/modules/instill-helpers'), // dynamic linked
      $modules: path.resolve('./node_modules'),
    }
  },
  // optimizeDeps: {
  //   include: ['./src/lib/cytosis2/*.js', './src/lib/cytosis2/*.json',],
  // },
};

export default config;
