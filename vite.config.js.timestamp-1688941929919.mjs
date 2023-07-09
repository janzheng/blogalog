// vite.config.js
import path from "path";
import { sveltekit } from "file:///Users/janzheng/Desktop/projects/phagedir/PDN-svkit/jan-zheng-cytosis/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { config as dotenvconf } from "file:///Users/janzheng/Desktop/projects/phagedir/PDN-svkit/jan-zheng-cytosis/node_modules/dotenv/lib/main.js";
dotenvconf();
console.log("Use Local?:", process.env.PUBLIC_LOCAL);
var config = {
  plugins: [
    sveltekit({
      extensions: [".svelte"]
    })
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
      $src: path.resolve("./src"),
      $routes: path.resolve("./src/routes"),
      $instill: path.resolve("./src/routes/instill"),
      // '$plasmid': process.env.PUBLIC_LOCAL == 'local' ? path.resolve('./src/plasmid') : path.resolve('./node_modules/plasmid'), // dynamic linked
      // '$plasmid': path.resolve('./src/plasmid'), // local linked
      $plasmid: path.resolve("./node_modules/plasmid"),
      // git linked
      "$instill-helpers": process.env.PUBLIC_LOCAL == "local" ? path.resolve("./src/plasmid/modules/instill-helpers") : path.resolve("./node_modules/plasmid/modules/instill-helpers"),
      // dynamic linked
      $modules: path.resolve("./node_modules")
    }
  },
  optimizeDeps: {
    include: ["./src/lib/cytosis2/**"]
  }
};
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamFuemhlbmcvRGVza3RvcC9wcm9qZWN0cy9waGFnZWRpci9QRE4tc3ZraXQvamFuLXpoZW5nLWN5dG9zaXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9qYW56aGVuZy9EZXNrdG9wL3Byb2plY3RzL3BoYWdlZGlyL1BETi1zdmtpdC9qYW4temhlbmctY3l0b3Npcy92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvamFuemhlbmcvRGVza3RvcC9wcm9qZWN0cy9waGFnZWRpci9QRE4tc3ZraXQvamFuLXpoZW5nLWN5dG9zaXMvdml0ZS5jb25maWcuanNcIjtcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tIFwiQHN2ZWx0ZWpzL2tpdC92aXRlXCI7XG4vLyBpbXBvcnQgeyBwbHVnaW4gYXMgbWFya2Rvd24sIE1vZGUgfSBmcm9tIFwidml0ZS1wbHVnaW4tbWFya2Rvd25cIjtcblxuaW1wb3J0IHsgY29uZmlnIGFzIGRvdGVudmNvbmYgfSBmcm9tIFwiZG90ZW52XCJcbmRvdGVudmNvbmYoKVxuXG5jb25zb2xlLmxvZygnVXNlIExvY2FsPzonLCBwcm9jZXNzLmVudi5QVUJMSUNfTE9DQUwpXG5cbi8qKiBAdHlwZSB7aW1wb3J0KFwidml0ZVwiKS5Vc2VyQ29uZmlnfSAqL1xuY29uc3QgY29uZmlnID0ge1xuICBwbHVnaW5zOiBbXG4gICAgc3ZlbHRla2l0KHtcbiAgICAgIGV4dGVuc2lvbnM6IFsnLnN2ZWx0ZSddLFxuICAgIH0pLFxuICBdLFxuICBzc3I6IHtcbiAgICAvLyBub0V4dGVybmFsOiBbJ3ByaXNtanMnLCAncHJpc20tc3ZlbHRlJ10sXG4gIH0sXG4gIC8vIGNzczoge1xuICAvLyAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgLy8gICAgIHNjc3M6IHtcbiAgLy8gICAgICAgYWRkaXRpb25hbERhdGE6IFwiQHVzZSBcXFwic3JjL2FwcC5zY3NzXFxcIiBhcyAqO1wiXG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIC8vIHRoZXNlIGFyZSB0aGUgYWxpYXNlcyBhbmQgcGF0aHMgdG8gdGhlbVxuICAgICAgJHNyYzogcGF0aC5yZXNvbHZlKCcuL3NyYycpLFxuICAgICAgJHJvdXRlczogcGF0aC5yZXNvbHZlKCcuL3NyYy9yb3V0ZXMnKSxcbiAgICAgICRpbnN0aWxsOiBwYXRoLnJlc29sdmUoJy4vc3JjL3JvdXRlcy9pbnN0aWxsJyksXG5cbiAgICAgIFxuICAgICAgLy8gJyRwbGFzbWlkJzogcHJvY2Vzcy5lbnYuUFVCTElDX0xPQ0FMID09ICdsb2NhbCcgPyBwYXRoLnJlc29sdmUoJy4vc3JjL3BsYXNtaWQnKSA6IHBhdGgucmVzb2x2ZSgnLi9ub2RlX21vZHVsZXMvcGxhc21pZCcpLCAvLyBkeW5hbWljIGxpbmtlZFxuICAgICAgLy8gJyRwbGFzbWlkJzogcGF0aC5yZXNvbHZlKCcuL3NyYy9wbGFzbWlkJyksIC8vIGxvY2FsIGxpbmtlZFxuICAgICAgJHBsYXNtaWQ6IHBhdGgucmVzb2x2ZSgnLi9ub2RlX21vZHVsZXMvcGxhc21pZCcpLCAvLyBnaXQgbGlua2VkXG5cbiAgICAgICckaW5zdGlsbC1oZWxwZXJzJzogcHJvY2Vzcy5lbnYuUFVCTElDX0xPQ0FMID09ICdsb2NhbCcgPyBwYXRoLnJlc29sdmUoJy4vc3JjL3BsYXNtaWQvbW9kdWxlcy9pbnN0aWxsLWhlbHBlcnMnKSA6IHBhdGgucmVzb2x2ZSgnLi9ub2RlX21vZHVsZXMvcGxhc21pZC9tb2R1bGVzL2luc3RpbGwtaGVscGVycycpLCAvLyBkeW5hbWljIGxpbmtlZFxuICAgICAgJG1vZHVsZXM6IHBhdGgucmVzb2x2ZSgnLi9ub2RlX21vZHVsZXMnKSxcbiAgICB9XG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsnLi9zcmMvbGliL2N5dG9zaXMyLyoqJyxdLFxuICB9LFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLE9BQU8sVUFBVTtBQUNqQixTQUFTLGlCQUFpQjtBQUcxQixTQUFTLFVBQVUsa0JBQWtCO0FBQ3JDLFdBQVc7QUFFWCxRQUFRLElBQUksZUFBZSxRQUFRLElBQUksWUFBWTtBQUduRCxJQUFNLFNBQVM7QUFBQSxFQUNiLFNBQVM7QUFBQSxJQUNQLFVBQVU7QUFBQSxNQUNSLFlBQVksQ0FBQyxTQUFTO0FBQUEsSUFDeEIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLEtBQUs7QUFBQTtBQUFBLEVBRUw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBUUEsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBO0FBQUEsTUFFTCxNQUFNLEtBQUssUUFBUSxPQUFPO0FBQUEsTUFDMUIsU0FBUyxLQUFLLFFBQVEsY0FBYztBQUFBLE1BQ3BDLFVBQVUsS0FBSyxRQUFRLHNCQUFzQjtBQUFBO0FBQUE7QUFBQSxNQUs3QyxVQUFVLEtBQUssUUFBUSx3QkFBd0I7QUFBQTtBQUFBLE1BRS9DLG9CQUFvQixRQUFRLElBQUksZ0JBQWdCLFVBQVUsS0FBSyxRQUFRLHVDQUF1QyxJQUFJLEtBQUssUUFBUSxnREFBZ0Q7QUFBQTtBQUFBLE1BQy9LLFVBQVUsS0FBSyxRQUFRLGdCQUFnQjtBQUFBLElBQ3pDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLHVCQUF3QjtBQUFBLEVBQ3BDO0FBQ0Y7QUFFQSxJQUFPLHNCQUFROyIsCiAgIm5hbWVzIjogW10KfQo=
