const FILE_SERVER_PREFERENCE_KIND = 10096;

import type { EventTemplate } from "@nostr-dev-kit/ndk";

// 追加: NIP-96サーバーの設定情報定義
export interface Nip96ServerConfig {
  api_url: string;
  download_url?: string;
  [key: string]: any;
}

// 追加: upload.ts から呼び出されている関数
export async function readServerConfig(serverUrl: string): Promise<Nip96ServerConfig> {
  console.log("[nip96] readServerConfig input:", serverUrl);
  try {
    const baseUrl = serverUrl.endsWith("/") ? serverUrl.slice(0, -1) : serverUrl;
    const response = await fetch(`${baseUrl}/.well-known/nostr/nip96.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const config = await response.json();
    console.log("[nip96] readServerConfig output:", config);
    return config as Nip96ServerConfig;
  } catch (err) {
    console.error("[nip96] Failed to read server config:", err);
    throw err;
  }
}

export function normalizeServerUrls(serverUrls: string[]): string[] {
  console.log("[nip96] normalizeServerUrls input:", serverUrls);

  const normalized = serverUrls
    .map((url) => url.trim())
    .filter(Boolean)
    .filter((url, index, self) => self.indexOf(url) === index)
    .filter((url) => {
      try {
        new URL(url);
        return true;
      } catch (err) {
        console.error("[nip96] Invalid URL:", url, err);
        return false;
      }
    });

  console.log("[nip96] normalizeServerUrls output:", normalized);
  return normalized;
}

export function generateFSPEventTemplate(
  serverUrls: string[]
): EventTemplate {
  console.log("[nip96] generateFSPEventTemplate input:", serverUrls);

  const myWorkerUrl =
    "https://nostr-cloudinary-proxy.ryotagtagtag.workers.dev";

  const normalized = normalizeServerUrls(serverUrls);

  if (!normalized.includes(myWorkerUrl)) {
    normalized.unshift(myWorkerUrl);
  }

  const eventTemplate: EventTemplate = {
    // 修正: 未定義だった FileServerPreference を FILE_SERVER_PREFERENCE_KIND に変更
    kind: FILE_SERVER_PREFERENCE_KIND,
    content: "",
    tags: normalized.map((serverUrl) => ["server", serverUrl]),
    created_at: Math.floor(Date.now() / 1000),
  };

  console.log(
    "[nip96] generateFSPEventTemplate output:",
    eventTemplate
  );

  return eventTemplate;
}

export function extractServerUrls(event: {
  tags?: string[][];
}): string[] {
  console.log("[nip96] extractServerUrls input:", event);

  if (!event?.tags) {
    console.warn("[nip96] No tags found");
    return [];
  }

  const urls = event.tags
    .filter((tag) => tag[0] === "server" && tag[1])
    .map((tag) => tag[1]);

  const normalized = normalizeServerUrls(urls);

  console.log("[nip96] extractServerUrls output:", normalized);

  return normalized;
}
