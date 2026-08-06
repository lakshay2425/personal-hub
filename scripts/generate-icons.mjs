import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const outDir = path.join(process.cwd(), "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

async function makeIcon({ size, filename, padded, bg }) {
  const canvas = size;
  const pad = padded ? Math.round(size * 0.1) : 0;
  const inner = canvas - pad * 2;
  const radius = Math.round(inner * 0.22);
  const fontSize = Math.round(inner * 0.55);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}">
  <rect width="${canvas}" height="${canvas}" fill="${bg}"/>
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${radius}" ry="${radius}" fill="#18181b"/>
  <text x="${canvas / 2}" y="${canvas / 2 + fontSize * 0.08}" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="${fontSize}" fill="#fafafa">Q</text>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, filename));
  console.log(`wrote ${filename}`);
}

await makeIcon({
  size: 192,
  filename: "icon-192.png",
  padded: false,
  bg: "#fafafa",
});
await makeIcon({
  size: 512,
  filename: "icon-512.png",
  padded: false,
  bg: "#fafafa",
});
await makeIcon({
  size: 512,
  filename: "icon-512-maskable.png",
  padded: true,
  bg: "#18181b",
});
await makeIcon({
  size: 180,
  filename: "apple-touch-icon.png",
  padded: false,
  bg: "#fafafa",
});
