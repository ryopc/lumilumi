import { sveltekit } from "@sveltejs/kit/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { defineConfig } from "vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  server: {
    host: true,
    headers: {
      "Content-Security-Policy": "worker-src 'self'; script-src 'self';",
    },
    watch: {
      usePolling: true,
    },
  },

  ssr: {
    noExternal: ["vite-plugin-node-polyfills"],
    external: ["node:fs", "node:path"],
  },

  plugins: [
    sveltekit(),
    svelteTesting(),
    nodePolyfills({
      globals: {
        Buffer: true,
        process: true,
      },
      protocolImports: true,
    }),

    SvelteKitPWA({
      strategies: "generateSW", // ←ここ変更
      registerType: "prompt",
      injectRegister: "auto",

      manifest: {
        short_name: "lumilumi",
        name: "lumilumi",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#000000",
      },

      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
});
