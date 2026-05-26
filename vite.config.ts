import { sveltekit } from "@sveltejs/kit/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { defineConfig } from "vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills"; // 👈 Nodeの互換用に追記

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
  plugins: [
    // 👈 1. string_decoder, buffer, url などのビルドエラーを消す設定を追加
    nodePolyfills({
      globals: {
        Buffer: true,
        process: true,
      },
      protocolImports: true,
    }),
    svelteTesting(),
    sveltekit(),
    SvelteKitPWA({
      strategies: "injectManifest",
      srcDir: "./src",
      filename: "service-worker.js",
      scope: "/",
      injectRegister: "auto",
      registerType: "prompt",

      pwaAssets: {
        config: true,
      },
      manifest: {
        short_name: "lumilumi",
        name: "lumilumi",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#000000",
        share_target: {
          action: "/post",
          method: "POST",
          enctype: "multipart/form-data",
          params: {
            title: "title",
            text: "text",
            url: "url",
            files: [
              {
                name: "media",
                accept: ["image/*", "video/*", "audio/*"],
              },
            ],
          },
        },
        protocol_handlers: [
          {
            protocol: "web+nostr",
            url: "./%s",
          },
        ],
      },
      injectManifest: {
        // 👈 2. エラーの原因だった「prerendered」の指定を削除し、確実に存在するファイルだけを対象にします
        globPatterns: [
          "client/**/*.{js,css,ico,png,svg,webp,webmanifest}",
        ],
        globIgnores: ["node_modules/**/*"],
      },
      devOptions: {
        enabled: true,
        suppressWarnings: process.env.SUPPRESS_WARNING === "true",
        type: "module",
      },
      kit: {
        includeVersionFile: true,
      },
    }),
  ],
});
