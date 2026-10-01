#!/usr/bin/env bun
/* Build reference/registry-index.md: every HyperFrames registry block and component, grouped by editorial role,
   so casting a storyboard beat to a ready-made item is a grep, not a hunt. Reads the live catalog through the CLI.
   usage: bun scripts/registry/build-index.mjs [hyperframesVersion]     (default: latest) */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PIN = process.argv[2] || "latest";
const OUT = path.join(import.meta.dir, "..", "..", "reference", "registry-index.md");

const catalog = (type) => {
  const raw = execFileSync("bun", ["x", `hyperframes@${PIN}`, "catalog", `--type=${type}`, "--json"], { encoding: "utf8", maxBuffer: 64 << 20 });
  const j = JSON.parse(raw.slice(raw.search(/[[{]/)));
  return Array.isArray(j) ? j : j.items ?? [];
};

// first matching role wins; order matters (specific before generic)
const ROLES = [
  ["Captions", ["captions", "caption-style", "karaoke"]],
  ["Lower-thirds and callouts", ["lower-third", "callout", "annotation", "badge", "notification", "hud", "speech-bubble", "social-overlay"]],
  ["Transitions", ["transition", "transition-primitive", "wipe", "match-cut", "whip", "whip-pan", "crossfade", "directional-cut", "iris", "dissolve", "shutter", "hard-cut", "portal"]],
  ["Camera, depth and space", ["camera", "camera-orbit", "parallax", "depth", "depth-of-field", "focus-rack", "push-in", "pull-back", "zoom", "orbit", "handheld", "shake", "3d", "3d-motion", "gltf"]],
  ["Openers, stings and end cards", ["intro", "end-card", "cta", "logo", "sting", "outro", "lockup", "wordmark", "store-badges", "logo-strip"]],
  ["Titles and kinetic type", ["title-card", "typography", "kinetic-type", "kinetic-text", "kinetic", "text", "text-effects", "text-effect", "headline", "handwritten", "variable-font", "scramble", "typing"]],
  ["Data, numbers and maps", ["data", "data-viz", "chart", "graph", "number", "counter", "stats", "statistics", "map", "choropleth", "geography", "gauge", "countdown"]],
  ["Product, UI and devices", ["mock-ui", "product-demo", "ui-props", "ui-flow", "device", "phone", "iphone", "app", "cursor", "chat", "code", "code-animation", "terminal", "browser", "desktop", "form"]],
  ["Texture, light and VFX", ["texture", "grain", "film", "light-leak", "vfx", "glow", "particles", "fog", "shader", "webgl", "background", "ambient", "color-grading", "grade", "vignette", "halftone", "dither", "chromatic", "glitch", "light", "aurora", "media-treatment-overlay", "motion-blur", "speed-ramp"]],
  ["Galleries and carousels", ["carousel", "gallery", "images"]],
  ["Motion primitives", ["motion-primitive", "video-primitive", "reveal", "stagger", "spring", "physics", "morph"]],
  ["Showcases and ad templates", ["showcase", "ad-template", "social"]],
];

const role = (i) => {
  const tags = new Set(i.tags ?? []);
  for (const [name, keys] of ROLES) if (keys.some((k) => tags.has(k))) return name;
  return "Other";
};
const fmt = (i) => {
  const d = i.dimensions ? ` · ${i.dimensions.width}x${i.dimensions.height}` : "";
  const t = i.duration ? ` · ${Number(i.duration).toFixed(1)} s` : "";
  const desc = String(i.description ?? "").replace(/\s+/g, " ");
  return `- \`${i.name}\` (${i.type === "block" ? "block" : "comp"}${d}${t}) ${desc.length > 170 ? desc.slice(0, 167) + "..." : desc} [${(i.tags ?? []).join(", ")}]`;
};

const items = [...catalog("block"), ...catalog("component")];
const groups = new Map(ROLES.map(([n]) => [n, []]).concat([["Other", []]]));
for (const i of items) groups.get(role(i)).push(i);

const L = [
  "# Registry index (generated)",
  "",
  `Every HyperFrames registry item (${items.length}: ${items.filter((i) => i.type === "block").length} blocks, ${items.filter((i) => i.type !== "block").length} components), grouped by editorial role.`,
  "Regenerate with `bun scripts/registry/build-index.mjs`. Install with `hyperframes add <name>`; read the item's",
  "variables in its `registry-item.json` (or `hyperframes catalog <name> --json`) before wiring it. Blocks are",
  "whole timed sub-compositions; components are snippets merged into a composition. Dimensions are the demo's.",
  "",
  "Casting rule: see [cinematic-grammar.md](cinematic-grammar.md#casting). Grep this file by role or tag first;",
  "hand-build only what no item covers, and say so in the report.",
  "",
];
for (const [name, list] of groups) {
  if (!list.length) continue;
  list.sort((a, b) => a.name.localeCompare(b.name));
  L.push(`## ${name} (${list.length})`, "", ...list.map(fmt), "");
}
fs.writeFileSync(OUT, L.join("\n"));
console.log(`wrote ${path.relative(process.cwd(), OUT)} · ${items.length} items · ${[...groups].map(([n, l]) => `${n}: ${l.length}`).join(" · ")}`);
