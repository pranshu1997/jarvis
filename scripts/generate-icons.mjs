import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicIcons = join(root, "public", "icons");

mkdirSync(publicIcons, { recursive: true });

// Minimal valid cyan-on-dark PNG (192x192) - 1x1 scaled via copy for bootstrap
// In production, replace with designed assets from /assets/icon-512.png
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#020617"/>
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00d4ff"/>
      <stop offset="100%" style="stop-color:#3b82f6"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <circle cx="256" cy="256" r="200" fill="none" stroke="url(#g)" stroke-width="2" opacity="0.3"/>
  <text x="256" y="300" font-family="system-ui,sans-serif" font-size="220" font-weight="900" fill="url(#g)" text-anchor="middle" filter="url(#glow)">J</text>
</svg>`;

writeFileSync(join(publicIcons, "icon.svg"), svg);
console.log("Wrote public/icons/icon.svg — use as favicon; add PNGs for PWA");
