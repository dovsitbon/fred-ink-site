import horaires from "@/data/horaires.json";
import annonces from "@/data/annonces.json";
import { intlLocale, type L10n, type Locale } from "@/lib/locales";

type Range = [string, string];
const week = horaires.week as unknown as Record<string, Range[] | null>;
const closures = horaires.closures as { from: string; to: string; label: L10n }[];

export const money = (n: number, lang: Locale) =>
  new Intl.NumberFormat(intlLocale[lang], { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/** « 18:45 » → « 18 h 45 » en français, « 6:45pm » en anglais. */
export function hourLabel(hhmm: string, lang: Locale) {
  const [h, m] = hhmm.split(":").map(Number);
  if (lang === "fr") return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")}${suffix}` : `${h12}${suffix}`;
}

/** Date et heure actuelles à Paris : { iso: AAAA-MM-JJ, day: 0-6, minutes depuis minuit }. */
export function parisNow(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: horaires.timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23" })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  return { iso: `${parts.year}-${parts.month}-${parts.day}`, day, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return { iso: t.toISOString().slice(0, 10), day: t.getUTCDay() };
};

export const closureOn = (iso: string) => closures.find((c) => c.from <= iso && iso <= c.to) ?? null;
export const rangesOn = (iso: string, day: number) => (closureOn(iso) ? null : week[String(day)]);
export const isOpenDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return !!rangesOn(iso, new Date(Date.UTC(y, m - 1, d)).getUTCDay());
};

export type OpenStatus = { open: true; until: string } | { open: false; nextDay: number; offset: number; at: string } | { open: false; nextDay: null };

/** Ouvert / fermé maintenant, et prochaine ouverture. */
export function openStatus(date = new Date()): OpenStatus {
  const now = parisNow(date);
  const today = rangesOn(now.iso, now.day) ?? [];
  for (const [a, b] of today) {
    if (now.minutes >= toMin(a) && now.minutes < toMin(b)) return { open: true, until: b };
    if (now.minutes < toMin(a)) return { open: false, nextDay: now.day, offset: 0, at: a };
  }
  for (let i = 1; i <= 14; i++) {
    const next = addDays(now.iso, i);
    const r = rangesOn(next.iso, next.day);
    if (r?.length) return { open: false, nextDay: next.day, offset: i, at: r[0][0] };
  }
  return { open: false, nextDay: null };
}

/** Les horaires de la semaine, du lundi au dimanche, regroupés pour l'affichage. */
export function weekRows() {
  return [1, 2, 3, 4, 5, 6, 0].map((day) => ({ day, ranges: week[String(day)] }));
}

export const upcomingClosures = (fromIso: string) => closures.filter((c) => c.to >= fromIso);

/** Annonce du bandeau : la plus récente active (soirée, guest, flash), sinon l'état de l'agenda. */
export function activeAnnouncement(iso: string) {
  const items = annonces.items.filter((a) => a.from <= iso && iso <= a.to).sort((a, b) => (a.from < b.from ? 1 : -1));
  if (items[0]) return { ...items[0], type: items[0].kind, kind: "item" as const };
  return { kind: "agenda" as const, id: `agenda-${annonces.agenda.status}`, status: annonces.agenda.status, text: annonces.agenda.text };
}

export const t = (v: L10n, lang: Locale) => v[lang];
