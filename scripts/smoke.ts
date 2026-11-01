import assert from "node:assert/strict";
import { resolve } from "node:path";
import { preview } from "./preview";

const soundFiles = [
  ...new Bun.Glob("*.wav").scanSync(resolve(import.meta.dir, "../dist")),
];
assert.equal(
  soundFiles.length,
  44,
  "Expected all 44 soundboard clips in output",
);
const spriteFiles = [
  ...new Bun.Glob("*.png").scanSync(resolve(import.meta.dir, "../dist")),
];
assert.equal(
  spriteFiles.length,
  7,
  "Expected two dungeon, three raid, and two Horde PvP class identity atlases",
);
const spriteDimensions = await Promise.all(
  spriteFiles.map(async (name) => {
    const bytes = await Bun.file(resolve(import.meta.dir, "../dist", name))
      .slice(0, 24)
      .arrayBuffer();
    const header = new DataView(bytes);
    return [header.getUint32(16), header.getUint32(20)];
  }),
);
assert.deepEqual(
  spriteDimensions.sort((a, b) => a[0]! - b[0]!),
  Array.from({ length: 7 }, () => [2304, 256]),
  "Expected nine 256px cells in each class identity atlas",
);

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
    for (const missing of [
      "api/info",
      "src/main.tsx",
      "missing.js",
      ".sprite-workshop/README.md",
      ".sprite-workshop/sources/generation.json",
      "src/horde-sprites/generation.json",
      "src/horde-sprites/classes/orc-warrior-source.png",
    ]) {
      const response = await fetch(new URL(missing, url));
      assert.equal(response.status, 404, `Unexpected public path: ${missing}`);
    }
    for (const name of spriteFiles) {
      const response = await fetch(new URL(name, url));
      assert.equal(response.status, 200, `Missing sprite atlas: ${name}`);
      assert.match(response.headers.get("content-type") ?? "", /image\/png/);
      const signature = new Uint8Array(
        (await response.arrayBuffer()).slice(0, 8),
      );
      assert.deepEqual([...signature], [137, 80, 78, 71, 13, 10, 26, 10]);
    }
    await Promise.all(
      soundFiles.map(async (name) => {
        const response = await fetch(new URL(name, url));
        assert.equal(response.status, 200, `Missing sound: ${name}`);
        assert.match(response.headers.get("content-type") ?? "", /audio\//);
        const bytes = await response.arrayBuffer();
        assert.equal(new TextDecoder().decode(bytes.slice(0, 4)), "RIFF");
      }),
    );
    console.log(`Static smoke passed: ${basePath}`);
  } finally {
    await server.stop(true);
  }
}
