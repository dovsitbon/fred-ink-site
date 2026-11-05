import type { Dict, Locale } from "@/lib/i18n";
import { artistBySlug, artistName, STYLES } from "@/lib/data";

// Demande de projet : validation partagée entre le formulaire (navigateur) et l'API (serveur), et texte de l'e-mail.

export const SIZES = ["s", "m", "l", "xl"] as const;
export const COLOURS = ["bw", "color", "unsure"] as const;
export const KINDS = ["new", "cover", "rework"] as const;
export const BUDGETS = ["a", "b", "c", "d", "e", "u"] as const;

export type ProjectRequest = {
  artist: string; // slug ou "" (peu importe)
  style: string; // id ou "" (je ne sais pas)
  idea: string;
  zone: string;
  size: (typeof SIZES)[number] | "";
  colour: (typeof COLOURS)[number];
  first: "yes" | "no" | "";
  kind: (typeof KINDS)[number];
  budget: (typeof BUDGETS)[number];
  availability: string;
  name: string;
  age: string;
  phone: string;
  email: string;
  consent: boolean;
};

export const emptyRequest = (): ProjectRequest => ({ artist: "", style: "", idea: "", zone: "", size: "", colour: "unsure", first: "", kind: "new", budget: "u", availability: "", name: "", age: "", phone: "", email: "", consent: false });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+\d][\d\s.-]{7,}$/;

export const isEmail = (v: string) => EMAIL.test(v.trim());
export const isPhone = (v: string) => PHONE.test(v.trim());
export const isMinor = (age: string) => Number(age) > 0 && Number(age) < 18;

export type Errors = Partial<Record<"idea" | "zone" | "size" | "name" | "age" | "contact" | "consent", true>>;

export function validate(q: ProjectRequest, step: 1 | 2 | 3 | "all"): Errors {
  const e: Errors = {};
  if (step === 1 || step === "all") {
    if (q.idea.trim().length < 5) e.idea = true;
  }
  if (step === 2 || step === "all") {
    if (!q.zone.trim()) e.zone = true;
    if (!q.size) e.size = true;
  }
  if (step === 3 || step === "all") {
    if (!q.name.trim()) e.name = true;
    const age = Number(q.age);
    if (!q.age || !Number.isFinite(age) || age < 10 || age > 120) e.age = true;
    if (!isPhone(q.phone) && !isEmail(q.email)) e.contact = true;
    if (q.email.trim() && !isEmail(q.email)) e.contact = true;
    if (!q.consent) e.consent = true;
  }
  return e;
}

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const oneOf = <T extends string>(v: unknown, list: readonly T[], dflt: T): T => (list.includes(v as T) ? (v as T) : dflt);

/** Relecture côté serveur : tout ce qui vient du navigateur est retypé et borné. */
export function parseRequest(raw: unknown): ProjectRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const q: ProjectRequest = {
    artist: artistBySlug(str(r.artist, 60)) ? str(r.artist, 60) : "",
    style: STYLES.some((s) => s.id === r.style) ? (r.style as string) : "",
    idea: str(r.idea, 3000),
    zone: str(r.zone, 200),
    size: oneOf(r.size, SIZES, "m"),
    colour: oneOf(r.colour, COLOURS, "unsure"),
    first: r.first === "yes" || r.first === "no" ? r.first : "",
    kind: oneOf(r.kind, KINDS, "new"),
    budget: oneOf(r.budget, BUDGETS, "u"),
    availability: str(r.availability, 600),
    name: str(r.name, 120),
    age: str(r.age, 3),
    phone: str(r.phone, 40),
    email: str(r.email, 160),
    consent: r.consent === true,
  };
  return Object.keys(validate(q, "all")).length ? null : q;
}

/** Récapitulatif lisible (e-mail au studio et confirmation au client). */
export function requestText(q: ProjectRequest, lang: Locale, d: Dict, photos = 0) {
  const f = d.form;
  const L = f.email_.labels;
  const a = artistBySlug(q.artist);
  const style = q.style ? d.styles.items[q.style as keyof Dict["styles"]["items"]].name : f.styleUnsure;
  const lines: [string, string][] = [
    [L.artist, a ? `${artistName(a)} (@${a.handle})` : f.anyArtist],
    [L.style, style],
    [L.kind, f.kinds[q.kind]],
    [L.zone, q.zone],
    [L.size, q.size ? f.sizes[q.size] : "—"],
    [L.colour, f.colours[q.colour]],
    [L.first, q.first ? f[q.first] : "—"],
    [L.budget, f.budgets[q.budget]],
    [L.availability, q.availability || "—"],
    [L.name, q.name],
    [L.age, q.age],
    [L.phone, q.phone || "—"],
    [L.email, q.email || "—"],
  ];
  if (photos) lines.push([L.photos, String(photos)]);
  const head = isMinor(q.age) ? `*${L.minor}*\n\n` : "";
  return `${head}${lines.map(([k, v]) => `${k} : ${v}`).join("\n")}\n\n${L.idea} :\n${q.idea}`;
}
