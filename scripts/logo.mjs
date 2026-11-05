// Vectorise le vrai logo de Fred-Ink (photo de profil Instagram : « FRED-INK » / « TATTOO STUDIO », or sur noir)
// en tracés SVG : public/logo.svg (or), public/logo-blanc.svg, components/logo-paths.json (mot + sous-titre séparés,
// pour que l'ouverture puisse dessiner « FRED-INK » seul).
//   npm run logo
// Quand le studio fournira son fichier d'origine, remplacer public/logo.svg et components/logo-paths.json.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import potrace from "potrace";

const ROOT = path.resolve(import.meta.dirname, "..");
const src = path.join(ROOT, "assets/raw/fred-ink_logo.jpg");
const SCALE = 3;

// Lettrage clair sur fond noir : on agrandit, on seuille, puis on inverse (potrace trace le noir)
const base = sharp(src).grayscale().resize({ width: 1080 * SCALE });
const { data, info } = await base.clone().threshold(90).raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const on = (x, y) => data[y * W + x] > 128;

// Profil des lignes pour séparer les deux lignes de texte
const rows = [];
for (let y = 0; y < H; y++) {
  let n = 0;
  for (let x = 0; x < W; x++) if (on(x, y)) n++;
  rows.push(n);
}
const bands = [];
let start = -1;
for (let y = 0; y < H; y++) {
  if (rows[y] > 2 && start < 0) start = y;
  if (rows[y] <= 2 && start >= 0) {
    if (y - start > 20 * SCALE) bands.push([start, y]);
    start = -1;
  }
}
if (bands.length < 2) throw new Error("lignes du logo introuvables " + JSON.stringify(bands));
const [word, sub] = bands.sort((a, b) => b[1] - b[0] - (a[1] - a[0])).slice(0, 2).sort((a, b) => a[0] - b[0]);

function colsOf([y0, y1]) {
  let minX = W, maxX = 0;
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) if (on(x, y)) { if (x < minX) minX = x; if (x > maxX) maxX = x; }
  return [minX, maxX];
}
const pad = 6 * SCALE;
const top = word[0] - pad, bottom = sub[1] + pad;
const [wx0, wx1] = colsOf(word);
const [sx0, sx1] = colsOf(sub);
const left = Math.min(wx0, sx0) - pad, right = Math.max(wx1, sx1) + pad;

const buf = await base.clone().extract({ left, top, width: right - left, height: bottom - top }).threshold(90).negate().png().toBuffer();
const trace = (b) => new Promise((ok, ko) => potrace.trace(b, { threshold: 128, turdSize: 30, optTolerance: 0.3 }, (e, s) => (e ? ko(e) : ok(s.match(/ d="([^"]+)"/)[1]))));

// Deux tracés : on masque l'autre ligne à chaque fois
const mask = async (keep) => {
  const h = bottom - top, w = right - left;
  const cut = keep === "word" ? { top: sub[0] - top - 2 * SCALE, height: h - (sub[0] - top - 2 * SCALE) } : { top: 0, height: word[1] - top + 2 * SCALE };
  const white = await sharp({ create: { width: w, height: cut.height, channels: 3, background: "#fff" } }).png().toBuffer();
  return sharp(buf).composite([{ input: white, left: 0, top: cut.top }]).png().toBuffer();
};
const dWord = await trace(await mask("word"));
const dSub = await trace(await mask("sub"));
const vb = `0 0 ${right - left} ${bottom - top}`;

const file = (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="Fred-Ink Tattoo Studio"><path fill="${fill}" fill-rule="evenodd" d="${dWord}"/><path fill="${fill}" fill-rule="evenodd" d="${dSub}"/></svg>\n`;
await writeFile(path.join(ROOT, "public/logo.svg"), file("#B8963E"));
await writeFile(path.join(ROOT, "public/logo-blanc.svg"), file("#EDE8E0"));
await writeFile(path.join(ROOT, "components/logo-paths.json"), JSON.stringify({ viewBox: vb, word: dWord, sub: dSub, wordBox: [0, word[0] - top, right - left, word[1] - word[0]] }) + "\n");
console.log("logo vectorisé", vb, { word, sub });
