import { preprocessMeltUI, sequence } from "@melt-ui/pp";
import adapter from "@sveltejs/adapter-cloudflare"; // 👈 cloudflareに変更
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config}*/
const config = {
  preprocess: sequence([vitePreprocess(), preprocessMeltUI()]),
  kit: {
    adapter: adapter(), // 👈 cloudflareアダプターを有効化
    serviceWorker: {
      // PWAプラグイン側で制御するため、SvelteKit標準の登録はオフ
      register: false,
    },
    csrf: {
      trustedOrigins: ["*"],
    },
  },
};

export default config;
