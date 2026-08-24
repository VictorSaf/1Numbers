// Stamps the built service worker with a per-build cache name.
//
// The name has to change every deploy: the worker's activate handler deletes
// caches that do not match it, so a constant name meant the first cache ever
// created was never cleaned up and outlived every release.
//
// The id is derived from the entry bundle's content hash, so it changes exactly
// when the app does and stays stable across rebuilds of identical output.

import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), "..", "dist");

const entry = (await readdir(join(DIST, "assets"))).find((f) => /^index-.*\.js$/.test(f));
const buildId = entry ? entry.replace(/^index-|\.js$/g, "") : String(Date.now());

const swPath = join(DIST, "sw.js");
const sw = await readFile(swPath, "utf8");
if (!sw.includes("__BUILD_ID__")) {
  console.warn("stamp-sw: placeholder not found; service worker left unchanged");
} else {
  await writeFile(swPath, sw.replace("__BUILD_ID__", buildId));
  console.log(`stamp-sw: cache name pinned to ${buildId}`);
}
