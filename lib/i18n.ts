import fr from "@/locales/fr.json";
import en from "@/locales/en.json";
import type { Locale } from "@/lib/locales";

export { defaultLocale, intlLocale, isLocale, locales, ogLocale, type L10n, type Locale } from "@/lib/locales";
export type Dict = typeof fr;

const dictionaries: Record<Locale, Dict> = { fr, en: en as Dict };

export const getDict = (lang: Locale): Dict => dictionaries[lang];

export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
