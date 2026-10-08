// Loads index.html headlessly and writes the SFX cue list the timeline
// registered (window.__SFX) to tools/sfx_cues.json for build_audio.py.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// PLAYWRIGHT_PATH lets a globally installed playwright be used without a local node_modules
const pw = await import(process.env.PLAYWRIGHT_PATH || "playwright");
const chromium = pw.chromium || pw.default.chromium;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on("pageerror", (e) => { console.error("page error:", e.message); process.exitCode = 1; });
await p.addInitScript(() => { window.__timelines = {}; });
await p.goto("file://" + path.join(root, "index.html"));
await p.waitForTimeout(300);
const cues = await p.evaluate(() => window.__SFX);
writeFileSync(path.join(root, "tools/sfx_cues.json"), JSON.stringify(cues, null, 1));
console.log(`${cues.length} cues ->`, [...new Set(cues.map((c) => c.name))].join(", "));
await b.close();
