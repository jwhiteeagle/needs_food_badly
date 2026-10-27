import assert from "node:assert/strict";
import { resolve } from "node:path";
import { preview } from "./preview";

const soundFiles = [
  ...new Bun.Glob("*.wav").scanSync(resolve(import.meta.dir, "../dist")),
];
assert.equal(soundFiles.length, 44, "Expected all 44 soundboard clips in output");

// Exercise static output at root and repository paths, without SPA fallbacks.
for (const basePath of ["/", "/needs_food_badly/"]) {
  const server = await preview(0, basePath);
  try {
    const url = new URL(basePath, server.url);
    const page = await fetch(url, { signal: AbortSignal.timeout(5000) });
    assert.equal(page.status, 200);
    assert.match(page.headers.get("content-type") ?? "", /text\/html/);
    const html = await page.text();
    assert.match(html, /<title>NEEDS FOOD BADLY<\/title>/);
    const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((match) => new URL(match[1]!, url))
      .filter((asset) => asset.origin === url.origin);
    assert(assets.length >= 3, "Expected bundled JavaScript, CSS, and favicon");
    for (const asset of assets) {
      assert(
        asset.pathname.startsWith(basePath),
        `Asset escaped prefix: ${asset}`,
      );
      const response = await fetch(asset, {
        signal: AbortSignal.timeout(5000),
      });
      assert.equal(response.status, 200, `Missing asset: ${asset}`);
      assert((await response.arrayBuffer()).byteLength > 0);
      assert.doesNotMatch(
        response.headers.get("content-type") ?? "",
        /text\/html/,
      );
    }
    for (const missing of ["api/info", "src/main.tsx", "missing.js"]) {
      const response = await fetch(new URL(missing, url));
      assert.equal(response.status, 404, `Unexpected public path: ${missing}`);
    }
    await Promise.all(soundFiles.map(async (name) => {
      const response = await fetch(new URL(name, url));
      assert.equal(response.status, 200, `Missing sound: ${name}`);
      assert.match(response.headers.get("content-type") ?? "", /audio\//);
      const bytes = await response.arrayBuffer();
      assert.equal(new TextDecoder().decode(bytes.slice(0, 4)), "RIFF");
    }));
    console.log(`Static smoke passed: ${basePath}`);
  } finally {
    await server.stop(true);
  }
}
