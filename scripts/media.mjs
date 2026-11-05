// Classe les photos Instagram de Fred-Ink (assets/raw/) dans assets/<catégorie>/ avec des noms lisibles,
// puis les prépare pour le web dans public/media/<catégorie>/ (next/image sert ensuite AVIF/WebP à la bonne taille).
//   npm run media
//
// Écartées : 02 (poitrine nue, mains sur la poitrine : à valider avec le studio avant publication),
// 03 (affiche de la soirée du 24 octobre, texte incrusté), 38 (prénoms lisibles dans le tatouage, sans accord),
// logo.jpg (vectorisé à part par npm run logo).
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const raw = (n) => path.join(ROOT, "assets/raw", `fred-ink_${n}.jpg`);

// [n° source, catégorie, nom, recadrage { top, bottom, left, right } en pixels retirés]
export const PICKS = [
  ["45_DUn2BC_jOzL", "hero", "spartiate-colisee-epaule", { top: 260 }],
  ["01_DMM80wiNl-C_video-cover", "studio", "devanture-rue-general-leclerc", { bottom: 300 }],
  ["26_DXPgHtpDC9C", "piercing", "daith-oreille", {}],

  ["07_DdmocK4Dluy", "projets", "temple-zeus-belier-avant-bras", {}],
  ["39_DVlpynODBkw", "projets", "portrait-realiste-avant-bras", {}],
  ["40_DVeZUoSjCYs", "projets", "oni-epaule-bras", {}],
  ["21_DYkEjqVjLsP", "projets", "hibou-tournesol-bras", {}],
  ["25_DXXMrryjJMC", "projets", "montre-gousset-baroque", {}],
  ["31_DWrgjEviE0-_video-cover", "projets", "lion-lettrage-avant-bras", {}],
  ["36_DV1R7GkjAo3", "projets", "motard-ville-avant-bras", {}],
  ["05_Ddy03Hljobd", "projets", "gorille-guerrier-avant-bras", {}],
  ["34_DWBcSiOjMbJ", "projets", "grue-bambou-avant-bras", {}],
  ["04_Dd8qBqwDJXf", "projets", "pivoine-ornement-avant-bras", {}],
  ["16_DZen_WjjBI4", "projets", "rose-mandala-avant-bras", {}],
  ["19_DYzMuv1s1mM", "projets", "floral-ornemental-avant-bras", {}],
  ["20_DYoocwXsY3-", "projets", "ornemental-main-poignet", {}],
  ["41_DVJnHwtjB5R", "projets", "roses-mandala-bras", {}],
  ["42_DVI4FvqDMi1", "projets", "ornemental-epaule-bras", {}],
  ["11_DcJTHynMtbj", "projets", "lys-avant-bras", {}],
  ["22_DYZKsxUMxS1", "projets", "rose-ornement-main", {}],
  ["13_DaVvSHIM-Nt", "projets", "oiseau-botanique-avant-bras", {}],
  ["14_DaU7ykdMITs", "projets", "soleil-lune-avant-bras", {}],
  ["15_DaK_E2KMMTp", "projets", "paresseux-pura-vida", {}],
  ["24_DXuTu6JjITd", "projets", "papillons-dos-nuque", {}],
  ["35_DV9HgLUDOeQ", "projets", "bebe-hercule-avant-bras", {}],
  ["12_DalVnMVOh5b", "projets", "chicano-hope-avant-bras", {}],
  ["30_DW4SasCjDtf", "projets", "catrina-mollet", {}],
  ["43_DUqtIiVDAmr", "projets", "scolopendre-lys-rouges", {}],
  ["44_DUoIRWEDBBw", "projets", "papillon-de-nuit-poitrine", {}],
  ["33_DWD_kpEDAZa", "projets", "coeur-sacre-flamme", {}],
  ["37_DVtdJShDAqL", "projets", "ornemental-blackwork-bras", {}],
  ["32_DWRsqkgDB_d", "projets", "oeil-bouche-avant-bras", {}],
  ["06_Ddt9LrMjQDV", "projets", "manga-super-guerrier-avant-bras", {}],
  ["08_DdcAFLHNMwR", "projets", "anime-neon-avant-bras", {}],
  ["09_DcgrmvJtckr", "projets", "fiole-soleil-avant-bras", {}],
  ["10_DcbitzZtRLV", "projets", "dragon-vert-bras", {}],
  ["17_DZVQMf_tf7U_video-cover", "projets", "renard-manchette-couleur", {}],
  ["18_DZK_KhEDdrs", "projets", "manchette-dessin-anime", {}],
  ["23_DX9uy5NtOF8", "projets", "coeur-anatomique-main", {}],
  ["27_DXFEXpFjf4y", "projets", "lapin-lavande-avant-bras", {}],
  ["28_DW9ZFFOjTDU", "projets", "manchettes-japonaises", {}],
  ["29_DW8gIz6DLYZ", "projets", "hirondelle-omoplate", {}],
];

const sizes = {};
for (const [n, cat, name, c] of PICKS) {
  const file = raw(n);
  const meta = await sharp(file).metadata();
  const box = {
    left: c.left ?? 0,
    top: c.top ?? 0,
    width: meta.width - (c.left ?? 0) - (c.right ?? 0),
    height: meta.height - (c.top ?? 0) - (c.bottom ?? 0),
  };
  await mkdir(path.join(ROOT, "assets", cat), { recursive: true });
  await mkdir(path.join(ROOT, "public/media", cat), { recursive: true });
  const cropped = sharp(file).rotate().extract(box);
  await cropped.clone().jpeg({ quality: 92 }).toFile(path.join(ROOT, "assets", cat, `${name}.jpg`));
  const max = cat === "hero" ? 2000 : 1400;
  const info = await cropped
    .clone()
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(ROOT, "public/media", cat, `${name}.jpg`));
  sizes[`/media/${cat}/${name}.jpg`] = [info.width, info.height];
}

// Galerie Instagram : une sélection de pièces, copiées dans assets/galerie (le site réutilise les fichiers de projets)
await mkdir(path.join(ROOT, "assets/galerie"), { recursive: true });
for (const name of ["scolopendre-lys-rouges", "temple-zeus-belier-avant-bras", "papillons-dos-nuque", "chicano-hope-avant-bras", "manchettes-japonaises", "pivoine-ornement-avant-bras", "oni-epaule-bras", "lapin-lavande-avant-bras"])
  await copyFile(path.join(ROOT, "assets/projets", `${name}.jpg`), path.join(ROOT, "assets/galerie", `${name}.jpg`));

// Emplacements prévus pour les photos à prendre sur place
for (const dir of ["studio/a-photographier", "artistes/a-photographier", "piercing/a-photographier", "hero/video-a-tourner"]) await mkdir(path.join(ROOT, "assets", dir), { recursive: true });

// Image de partage (Open Graph) 1200 × 630 : fond noir, la pièce du hero à droite, le logo à gauche
const hero = await sharp(raw("45_DUn2BC_jOzL")).extract({ left: 280, top: 520, width: 1000, height: 1050 }).resize(600, 630, { fit: "cover" }).toBuffer();
const logo = await sharp(path.join(ROOT, "public/logo.svg"), { density: 150 }).resize({ width: 460 }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#0E0E0F" } })
  .composite([
    { input: hero, left: 600, top: 0 },
    { input: logo, left: 70, top: 230 },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(ROOT, "public/og.jpg"));

await writeFile(path.join(ROOT, "data/media-sizes.json"), JSON.stringify(sizes, null, 1) + "\n");
await copyFile(raw("logo"), path.join(ROOT, "assets/logo-instagram.jpg"));
console.log(`${PICKS.length} images prêtes`);
