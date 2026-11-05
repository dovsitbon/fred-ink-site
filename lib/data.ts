import artistes from "@/data/artistes.json";
import projets from "@/data/projets.json";
import styles from "@/data/styles.json";
import type { L10n, Locale } from "@/lib/locales";

export type Artist = { slug: string; handle: string; name: string | null; role: L10n | null; styles: string[]; photo: string | null; bio: L10n | null };
export type Project = { id: string; image: string; styles: string[]; zone: string; color: boolean; artist: string | null; sessions: number | null; alt: Record<Locale, string> };
export type Style = (typeof styles.items)[number];

export const ARTISTS = artistes.items as unknown as Artist[];
export const PROJECTS = projets.items as Project[];
export const STYLES = styles.items as Style[];

/** Prénom s'il est confirmé, sinon le pseudo Instagram. */
export const artistName = (a: Artist) => a.name ?? `@${a.handle}`;
export const artistInsta = (a: Artist) => `https://www.instagram.com/${a.handle}/`;
export const artistBySlug = (slug: string | null | undefined) => ARTISTS.find((a) => a.slug === slug) ?? null;
export const projectsOf = (slug: string) => PROJECTS.filter((p) => p.artist === slug);
export const projectsInStyle = (id: string) => PROJECTS.filter((p) => p.styles.includes(id));
