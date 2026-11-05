// Génère CONTENU.md : tous les textes du site (FR et EN), les artistes, les styles et les pièces, pour validation par le studio.
//   npm run contenu
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const json = async (f) => JSON.parse(await readFile(path.join(ROOT, f), "utf8"));
const [fr, en, artistes, styles, projets, piercing, annonces, horaires, site] = await Promise.all(
  ["locales/fr.json", "locales/en.json", "data/artistes.json", "data/styles.json", "data/projets.json", "data/piercing.json", "data/annonces.json", "data/horaires.json", "data/site.json"].map(json),
);

const out = [];
const h = (n, t) => out.push(`\n${"#".repeat(n)} ${t}\n`);
const walk = (a, b, key = "") => {
  if (typeof a === "string") return out.push(`- **${key}**\n  - FR : ${a.replace(/\n/g, " ⏎ ")}\n  - EN : ${String(b ?? "—").replace(/\n/g, " ⏎ ")}`);
  if (Array.isArray(a)) return a.forEach((x, i) => walk(x, b?.[i], `${key}[${i + 1}]`));
  for (const k of Object.keys(a)) walk(a[k], b?.[k], key ? `${key}.${k}` : k);
};

out.push(`# Fred-Ink Tattoo Studio : contenu du site à valider\n\nGénéré par \`npm run contenu\` le ${new Date().toISOString().slice(0, 10)}. Tout ce qui est marqué **À CONFIRMER** vient de sources publiques (Instagram, Facebook, Google) ou de la réglementation générale, pas du studio lui-même.`);

h(2, "Infos pratiques");
out.push(`- Adresse : ${site.address.street}, ${site.address.postalCode} ${site.address.city}\n- Téléphone : ${site.phone} (fixe : pas de WhatsApp tant qu'aucun portable n'est donné)\n- E-mail : ${site.email ?? "**À DEMANDER**"}\n- Instagram : ${site.instagram}\n- Note Google : ${site.rating.value}/5, ${site.rating.count} avis (relevé le ${site.rating.asOf})\n- Équipe : ${site.team.tattooers} tatoueurs, ${site.team.piercers} perceurs, depuis ${site.team.since} (**À CONFIRMER**)\n- Horaires : ${Object.entries(horaires.week).map(([d, r]) => `${fr.days[d]} ${r ? r.map((x) => x.join("–")).join(", ") : "fermé"}`).join(" · ")} (Mappy indique 10 h 30 en semaine : **À CONFIRMER**)`);

h(2, "Artistes (prénoms, styles, portraits À CONFIRMER)");
for (const a of artistes.items) out.push(`- @${a.handle} → affiché « ${a.name ?? "@" + a.handle} »${a.role ? `, ${a.role.fr}` : ""} · styles : ${a.styles.length ? a.styles.join(", ") : "**à renseigner**"} · photo : ${a.photo ?? "**à prendre**"}`);

h(2, "Styles et pages SEO");
for (const s of styles.items) out.push(`- ${fr.styles.items[s.id].name} : /fr/${s.slug.fr} · /en/${s.slug.en}${s.image ? "" : " (pas encore de photo : avant/après à fournir)"}`);

h(2, "Pièces du portfolio (artiste et nombre de séances À CONFIRMER)");
out.push("| # | Fichier | Style | Zone | Artiste | Séances | Légende FR |\n|---|---|---|---|---|---|---|");
projets.items.forEach((p, i) => out.push(`| ${i + 1} | ${p.id} | ${p.styles.join(", ")} | ${fr.zones[p.zone]} | ${p.artist ?? "?"} | ${p.sessions ?? "?"} | ${p.alt.fr} |`));

h(2, "Piercing (prix « à partir de » À REMPLIR)");
for (const p of piercing.items) out.push(`- ${p.name.fr} : ${p.price ? p.price + " €" : "?"}`);

h(2, "Bandeau d'annonces (data/annonces.json)");
out.push(`- Agenda : ${annonces.agenda.status} · « ${annonces.agenda.text.fr} »`);
for (const a of annonces.items) out.push(`- ${a.kind} du ${a.from} au ${a.to} : « ${a.text.fr} »`);

h(2, "Tous les textes (FR / EN)");
walk(fr, en);

await writeFile(path.join(ROOT, "CONTENU.md"), out.join("\n") + "\n");
console.log("CONTENU.md écrit");
