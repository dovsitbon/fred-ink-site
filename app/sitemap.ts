import type { MetadataRoute } from "next";
import site from "@/data/site.json";
import { locales, type Locale } from "@/lib/locales";
import { artistHref, href, styleHref } from "@/lib/routes";
import { ARTISTS, STYLES } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: { path: (l: Locale) => string; priority: number }[] = [
    { path: (l) => href(l, "home"), priority: 1 },
    { path: (l) => href(l, "project"), priority: 0.9 },
    { path: (l) => href(l, "piercing"), priority: 0.8 },
    ...STYLES.map((s) => ({ path: (l: Locale) => styleHref(l, s.id), priority: 0.8 })),
    ...ARTISTS.map((a) => ({ path: (l: Locale) => artistHref(l, a.slug), priority: 0.7 })),
  ];
  return entries.flatMap((e) =>
    locales.map((lang) => ({
      url: `${site.url}${e.path(lang)}`,
      lastModified: new Date(),
      changeFrequency: e.priority === 1 ? ("weekly" as const) : ("monthly" as const),
      priority: e.priority,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${site.url}${e.path(l)}`])) },
    })),
  );
}
