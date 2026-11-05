import type { Locale } from "@/lib/locales";
import styles from "@/data/styles.json";
import artistes from "@/data/artistes.json";

// Adresses des pages, traduites (hreflang). Les pages de style viennent de data/styles.json,
// les fiches artistes de data/artistes.json (/fr/artistes/<slug>, /en/artists/<slug>).
export const PAGES = {
  project: { fr: "proposer-mon-projet", en: "send-your-idea" },
  piercing: { fr: "piercing-amiens", en: "body-piercing-amiens" },
  legal: { fr: "mentions-legales", en: "legal-notice" },
} as const satisfies Record<string, Record<Locale, string>>;

export const ARTISTS_DIR = { fr: "artistes", en: "artists" } as const satisfies Record<Locale, string>;

export type PageId = keyof typeof PAGES;
export type StyleId = (typeof styles.items)[number]["id"];

/** Chemin d'une page (« home » = accueil), avec une ancre facultative. */
export function href(lang: Locale, page: PageId | "home", hash = "") {
  const base = page === "home" ? `/${lang}` : `/${lang}/${PAGES[page][lang]}`;
  return hash ? `${base}#${hash}` : base;
}

export const styleHref = (lang: Locale, id: string) => {
  const s = styles.items.find((x) => x.id === id);
  return s ? `/${lang}/${s.slug[lang]}` : `/${lang}`;
};

export const artistHref = (lang: Locale, slug: string) => `/${lang}/${ARTISTS_DIR[lang]}/${slug}`;

/** Formulaire de projet pré-rempli (artiste, style). */
export const projectHref = (lang: Locale, q: { artist?: string; style?: string } = {}) => {
  const p = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]).toString();
  return href(lang, "project") + (p ? `?${p}` : "");
};

/** Ce que désigne un slug, quelle que soit la langue. */
export function resolveSlug(lang: Locale, slug: string): { kind: "page"; id: PageId } | { kind: "style"; id: string } | null {
  for (const [id, s] of Object.entries(PAGES)) if (s[lang] === slug) return { kind: "page", id: id as PageId };
  const st = styles.items.find((x) => x.slug[lang] === slug);
  return st ? { kind: "style", id: st.id } : null;
}

/** Tous les slugs de premier niveau d'une langue (generateStaticParams). */
export const allSlugs = (lang: Locale) => [...Object.values(PAGES).map((p) => p[lang]), ...styles.items.map((s) => s.slug[lang])];

/** Même page dans l'autre langue (sélecteur FR · EN). */
export function switchPath(pathname: string, to: Locale) {
  const [, , slug = "", sub] = pathname.split("/");
  if (!slug) return `/${to}`;
  if ((Object.values(ARTISTS_DIR) as string[]).includes(slug) && sub && artistes.items.some((a) => a.slug === sub)) return artistHref(to, sub);
  for (const s of Object.values(PAGES)) if ((Object.values(s) as string[]).includes(slug)) return `/${to}/${s[to]}`;
  const st = styles.items.find((x) => (Object.values(x.slug) as string[]).includes(slug));
  if (st) return `/${to}/${st.slug[to]}`;
  return `/${to}`;
}
