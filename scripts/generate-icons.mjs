import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.join(process.cwd(), "public");
const outDir = path.join(publicDir, "icons");

fs.mkdirSync(outDir, { recursive: true });

const logoInner = `
  <defs>
    <linearGradient id="accent" x1="208" y1="307" x2="816" y2="716" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#38bdf8"/>
      <stop offset="0.5" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#10b981"/>
    </linearGradient>
    <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="28" stdDeviation="34" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="1024" height="1024" rx="232" fill="#fafafa"/>
  <circle cx="760" cy="258" r="180" fill="#38bdf8" opacity="0.12"/>
  <circle cx="276" cy="760" r="210" fill="#10b981" opacity="0.12"/>
  <g filter="url(#logo-shadow)">
    <path d="M326 333h372c73 0 132 59 132 132v246c0 73-59 132-132 132H326c-73 0-132-59-132-132V465c0-73 59-132 132-132Z" fill="#ffffff"/>
  </g>
  <path d="M374 333v-70c0-49 40-89 89-89h98c49 0 89 40 89 89v70" fill="none" stroke="#18181b" stroke-width="48" stroke-linecap="round"/>
  <path d="M326 333h372c73 0 132 59 132 132v246c0 73-59 132-132 132H326c-73 0-132-59-132-132V465c0-73 59-132 132-132Z" fill="none" stroke="#18181b" stroke-width="48"/>
  <path d="M218 471h612v116H218z" fill="url(#accent)" opacity="0.88"/>
  <path d="M434 526c0-43 35-79 78-79s78 36 78 79c0 31-17 51-42 69-22 16-36 28-36 59" fill="none" stroke="#2563eb" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="512" cy="724" r="25" fill="#2563eb"/>
  <circle cx="348" cy="694" r="24" fill="#38bdf8"/>
  <circle cx="348" cy="756" r="24" fill="#10b981"/>
  <path d="m336 756 10 10 20-24" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M408 694h88M408 756h258" fill="none" stroke="#18181b" stroke-width="18" stroke-linecap="round" opacity="0.78"/>
`;

const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
${logoInner}
</svg>`;

async function writePng(buffer, filepath, resize) {
  let image = sharp(buffer);
  if (resize) {
    image = image.resize(resize);
  }
  await image.png().toFile(filepath);
}

const logoBuffer = Buffer.from(logoSvg);

await writePng(logoBuffer, path.join(publicDir, "logo.png"), {
  width: 512,
  height: 512,
  fit: "cover",
});
await writePng(logoBuffer, path.join(outDir, "icon-192.png"), {
  width: 192,
  height: 192,
  fit: "cover",
});
await writePng(logoBuffer, path.join(outDir, "icon-512.png"), {
  width: 512,
  height: 512,
  fit: "cover",
});
await writePng(logoBuffer, path.join(outDir, "icon-512-maskable.png"), {
  width: 512,
  height: 512,
  fit: "contain",
  background: "#fafafa",
});
await writePng(logoBuffer, path.join(outDir, "apple-touch-icon.png"), {
  width: 180,
  height: 180,
  fit: "cover",
});
console.log("wrote public/logo.png");
console.log("wrote public/icons/*.png");
