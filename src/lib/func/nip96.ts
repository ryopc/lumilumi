import type { EventTemplate } from "@nostr-dev-kit/ndk";

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
    kind: FileServerPreference,
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
