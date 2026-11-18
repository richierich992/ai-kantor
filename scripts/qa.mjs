import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const fail = message => { console.error("FAIL:", message); process.exitCode = 1; };
const ok = message => console.log("PASS:", message);

const html = read("index.html");
const modules = [
  "premium-world.js",
  "premium-character.js",
  "premium-social.js"
];

for (const file of modules) {
  if (!fs.existsSync(path.join(root, file))) fail(`Missing module: ${file}`);
  else {
    const result = spawnSync("node", ["--check", path.join(root, file)], { encoding: "utf8" });
    if (result.status !== 0) fail(`Syntax error in ${file}: ${result.stderr}`);
    else ok(`Syntax: ${file}`);
  }
}

for (const file of modules) {
  if (!html.includes(`from './${file}'`)) fail(`index.html does not import ${file}`);
}
ok("Premium modules imported by index.html");

const moduleMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/i);
if (!moduleMatch) fail("Main module script not found in index.html");
else {
  const temp = path.join(os.tmpdir(), "kantor-ai-inline-module-check.mjs");
  fs.writeFileSync(temp, moduleMatch[1]);
  const result = spawnSync("node", ["--check", temp], { encoding: "utf8" });
  fs.rmSync(temp, { force: true });
  if (result.status !== 0) fail(`Inline module syntax error: ${result.stderr}`);
  else ok("Inline application module syntax");
}

const manifestMatch = html.match(/async function loadGLBs\(\)[\s\S]*?await Promise\.all\(\[([\s\S]*?)\]\.map\(n=>/);
if (!manifestMatch) fail("GLB loader manifest not found");
else {
  const names = [...manifestMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
  const missing = names.filter(name => !fs.existsSync(path.join(root, "assets", name + ".glb")));
  if (missing.length) fail("Missing GLB assets: " + missing.join(", "));
  else ok(`GLB manifest: ${names.length} files exist`);
}

const requiredHooks = [
  "enhanceOfficeWorld",
  "decoratePremiumCharacter",
  "animatePremiumCharacter",
  "enhanceSocialHub",
  "updateSocialHub",
  "animateSocialCharacter"
];
for (const hook of requiredHooks) {
  if (!html.includes(hook)) fail(`Missing integration hook: ${hook}`);
}
if (requiredHooks.every(hook => html.includes(hook))) ok("Premium phase integration hooks");

if (!html.includes("if(document.hidden)")) fail("Hidden-tab render pause missing");
if (!html.includes("PREMIUM_LOW_POWER")) fail("Adaptive low-power profile missing");
if (html.includes("sun.shadow.mapSize.set(4096,4096)")) fail("Legacy 4096 shadow map still enabled");
if (!html.includes("PREMIUM_LOW_POWER?1024:2048")) fail("Adaptive shadow resolution missing");
if (process.exitCode) process.exit(process.exitCode);
console.log("Kantor AI Phase 5 QA checks passed.");
