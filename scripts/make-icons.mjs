// Renders the app icon (vermilion torii on washi, sun behind) to PNGs for the PWA.
//   node scripts/make-icons.mjs
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const svg = (pad = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#f6efe3"/>
  <g transform="translate(${pad} ${pad}) scale(${(512 - pad * 2) / 512})">
    <circle cx="256" cy="230" r="150" fill="#f4cfc8"/>
    <rect x="160" y="190" width="30" height="230" fill="#d4573b"/>
    <rect x="322" y="190" width="30" height="230" fill="#d4573b"/>
    <rect x="140" y="232" width="232" height="22" fill="#d4573b"/>
    <rect x="243" y="178" width="26" height="54" fill="#d4573b"/>
    <path d="M100 150 Q256 182 412 150 L420 128 Q256 160 92 128Z" fill="#2b2522"/>
    <rect x="120" y="168" width="272" height="20" fill="#d4573b"/>
    <rect x="152" y="404" width="46" height="22" fill="#2b2522"/>
    <rect x="314" y="404" width="46" height="22" fill="#2b2522"/>
  </g>
</svg>`;

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon.svg", svg());
for (const [name, size, pad] of [
  ["icon-192.png", 192, 0],
  ["icon-512.png", 512, 0],
  ["maskable-512.png", 512, 70],
  ["apple-touch-icon.png", 180, 30],
]) {
  await sharp(Buffer.from(svg(pad))).resize(size, size).png().toFile(`public/icons/${name}`);
  console.log("wrote", name);
}
