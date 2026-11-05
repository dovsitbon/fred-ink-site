// Affichette A5 imprimable (PDF) avec QR code vers la demande de projet, pour la vitrine ou le comptoir.
//   npm run affichette   →   public/affichette-fred-ink-a5.pdf  (+ aperçu assets/affichette-apercu.png)
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const site = JSON.parse(await readFile(path.join(ROOT, "data/site.json"), "utf8"));
const url = `${site.url}/fr/proposer-mon-projet`;

const hex = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const INK = hex("#0E0E0F");
const BONE = hex("#EDE8E0");
const GOLD = hex("#B8963E");
const ASH = hex("#A9A49C");

const pdf = await PDFDocument.create();
pdf.setTitle("Fred-Ink Tattoo Studio : affichette A5");
pdf.setAuthor("Fred-Ink Tattoo Studio");
const W = 419.53;
const H = 595.28;
const page = pdf.addPage([W, H]);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
const sans = await pdf.embedFont(StandardFonts.Helvetica);
page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: INK });

// Photo : la manchette spartiate, en bandeau haut
const photo = await sharp(path.join(ROOT, "public/media/hero/spartiate-colisee-epaule.jpg")).resize(1260, 720, { fit: "cover", position: "attention" }).jpeg({ quality: 88 }).toBuffer();
const img = await pdf.embedJpg(photo);
const photoH = 240;
page.drawImage(img, { x: 0, y: H - photoH, width: W, height: photoH });

// Logo (tracé du vrai logo) en PNG haute définition : pdf-lib ignore la règle evenodd des tracés SVG
const logoPng = await sharp(path.join(ROOT, "public/logo.svg"), { density: 300 }).resize({ width: 1400 }).png().toBuffer();
const logo = await pdf.embedPng(logoPng);
const logoW = 170;
const logoH = (logo.height / logo.width) * logoW;
let y = H - photoH - 30 - logoH;
page.drawImage(logo, { x: (W - logoW) / 2, y, width: logoW, height: logoH });

const center = (text, font, size, yy, color = BONE) => page.drawText(text, { x: (W - font.widthOfTextAtSize(text, size)) / 2, y: yy, size, font, color });

y -= 34;
center("VOTRE IDÉE, NOTRE TRAIT", bold, 20, y);
y -= 18;
center("Envoyez votre projet de tatouage en ligne : l'artiste vous rappelle.", sans, 9.5, y, ASH);

const qrPng = await QRCode.toBuffer(url, { margin: 1, width: 600, color: { dark: "#0E0E0F", light: "#EDE8E0" }, errorCorrectionLevel: "M" });
const qr = await pdf.embedPng(qrPng);
const qrS = 100;
y -= 16 + qrS;
page.drawImage(qr, { x: (W - qrS) / 2, y, width: qrS, height: qrS });
y -= 16;
center(url.replace(/^https?:\/\//, ""), sans, 8, y, GOLD);

y -= 20;
page.drawLine({ start: { x: 70, y }, end: { x: W - 70, y }, thickness: 0.5, color: hex("#333336") });
y -= 16;
center("Réalisme · Floral · Fineline · Couleur · Chicano · Graphique · Cover · Piercing", sans, 7.5, y, ASH);
y -= 15;
center(`${site.address.street}, ${site.address.postalCode} ${site.address.city}  ·  ${site.phone}`, sans, 8.5, y);
y -= 13;
center(`Mar.–ven. 10 h – 18 h 30 · sam. 9 h 30 – 18 h  ·  ${site.instagramHandle}`, sans, 8.5, y);

const bytes = await pdf.save();
await writeFile(path.join(ROOT, "public/affichette-fred-ink-a5.pdf"), bytes);
console.log("affichette prête :", url);
