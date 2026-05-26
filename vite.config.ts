import { sveltekit } from "@sveltejs/kit/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { defineConfig } from "vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import fs from "fs"; // 👈 同期生成用に追記
import path from "path"; // 👈 同期生成用に追記

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
    // 💡 1. 完璧なバグ回避策：ビルド前にダミーファイルを強制生成してENOENTを防ぐ
    {
      name: "pwa-sw-fix",
      buildStart() {
        const swDir = path.resolve(".svelte-kit/output/client");
        const swFile = path.resolve(swDir, "service-worker.js");
        
        if (!fs.existsSync(swDir)) {
          fs.mkdirSync(swDir, { recursive: true });
        }
        if (!fs.existsSync(swFile)) {
          fs.writeFileSync(swFile, "// dummy sw for build fix", "utf-8");
        }
      }
    },
    // 2. string_decoder, buffer などのエラーを消す設定
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
