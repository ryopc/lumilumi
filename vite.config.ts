import { sveltekit } from "@sveltejs/kit/vite";
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
  // 💡 Cloudflare環境でNode.jsの組み込みモジュールを要求された場合のクラッシュを防ぐ
  ssr: {
    noExternal: ["vite-plugin-node-polyfills"],
    external: ["node:fs", "node:path"] 
  },
  plugins: [
    // 💡 SvelteKitのプラグインを配列の先頭に配置します
    sveltekit(),
    svelteTesting(),
    nodePolyfills({
      // 💡 ブラウザ環境（クライアントサイド）のみでポリフィルを有効化
      globals: {
        Buffer: true,
        process: true,
      },
      protocolImports: true,
    }),
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
        // 💡 Cloudflareの出力構造に合わせるためclient配下を明示
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
