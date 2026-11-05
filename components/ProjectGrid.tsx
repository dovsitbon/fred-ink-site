"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/providers";
import { ArrowIcon, CloseIcon } from "@/components/icons";
import { fill } from "@/lib/i18n";
import { artistHref, projectHref } from "@/lib/routes";
import { ARTISTS, PROJECTS, STYLES, artistBySlug, artistName, type Project } from "@/lib/data";

/**
 * Grille « Projets » : chaque pièce avec son style, sa zone, ses séances et son artiste (quand ils sont confirmés),
 * filtres par style et par artiste, lightbox au clavier (← → Échap).
 */
export function ProjectGrid({ items = PROJECTS, filters = true, limit = 12 }: { items?: Project[]; filters?: boolean; limit?: number }) {
  const { lang, d } = useLocale();
  const t = d.projects;
  const reduce = useReducedMotion();
  const [style, setStyle] = useState<string | null>(null);
  const [artist, setArtist] = useState<string | null>(null);
  const [shown, setShown] = useState(limit);
  const [open, setOpen] = useState<number | null>(null);

  const list = useMemo(() => items.filter((p) => (!style || p.styles.includes(style)) && (!artist || p.artist === artist)), [items, style, artist]);
  const visible = list.slice(0, shown);
  const withArtists = ARTISTS.filter((a) => items.some((p) => p.artist === a.slug));
  const styleName = (id: string) => d.styles.items[id as keyof typeof d.styles.items]?.name ?? id;

  const go = useCallback((dir: number) => setOpen((i) => (i === null ? i : (i + dir + list.length) % list.length)), [list.length]);

  useEffect(() => {
    if (open === null) return;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [open, go]);

  const pick = (fn: (v: string | null) => void, v: string | null) => {
    fn(v);
    setShown(limit);
  };

  const current = open !== null ? list[open] : null;

  return (
    <div>
      {filters && (
        <div className="space-y-4">
          <div role="group" aria-label={t.filterStyle} className="flex flex-wrap items-center gap-2">
            <span className="nav-link me-2 text-ash">{t.filterStyle}</span>
            <button type="button" className="chip" aria-pressed={style === null} onClick={() => pick(setStyle, null)}>
              {t.all}
            </button>
            {STYLES.filter((s) => items.some((p) => p.styles.includes(s.id))).map((s) => (
              <button key={s.id} type="button" className="chip" aria-pressed={style === s.id} onClick={() => pick(setStyle, s.id)}>
                {styleName(s.id)}
              </button>
            ))}
          </div>
          {withArtists.length > 0 && (
            <div role="group" aria-label={t.filterArtist} className="flex flex-wrap items-center gap-2">
              <span className="nav-link me-2 text-ash">{t.filterArtist}</span>
              <button type="button" className="chip" aria-pressed={artist === null} onClick={() => pick(setArtist, null)}>
                {t.all}
              </button>
              {withArtists.map((a) => (
                <button key={a.slug} type="button" className="chip" aria-pressed={artist === a.slug} onClick={() => pick(setArtist, a.slug)}>
                  {artistName(a)}
                </button>
              ))}
            </div>
          )}
          <p className="text-[0.875rem] text-ash" aria-live="polite">
            {fill(t.count, { n: list.length })}
          </p>
        </div>
      )}

      {list.length === 0 ? (
        <p className="mt-10 text-ash">{t.empty}</p>
      ) : (
        <motion.ul layout={!reduce} className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence initial={false}>
            {visible.map((p, i) => {
              const a = artistBySlug(p.artist);
              return (
                <motion.li key={p.id} layout={!reduce} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                  <button type="button" onClick={() => setOpen(i)} className="group block w-full text-left" aria-label={fill(t.open, { alt: p.alt[lang] })}>
                    <div className="shine tone relative aspect-[4/5]">
                      <Image src={p.image} alt={p.alt[lang]} fill sizes="(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 48vw" className="object-cover" />
                    </div>
                  </button>
                  <div className="mt-3 flex items-start justify-between gap-3 text-[0.8125rem]">
                    <p className="nav-link !text-[0.9375rem] text-bone">{styleName(p.styles[0])}</p>
                    <p className="text-right text-ash">{d.zones[p.zone as keyof typeof d.zones]}</p>
                  </div>
                  {(a || p.sessions) && (
                    <p className="mt-1 text-[0.8125rem] text-ash">
                      {[a && artistName(a), p.sessions && fill(t.sessions, { n: p.sessions })].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}

      {shown < list.length && (
        <div className="mt-10">
          <button type="button" onClick={() => setShown((n) => n + limit)} className="btn-line">
            {t.more}
          </button>
        </div>
      )}

      <AnimatePresence>
        {current && (
          <motion.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={current.alt[lang]}
            className="fixed inset-0 z-50 flex flex-col bg-ink/97 backdrop-blur-sm lg:flex-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="relative min-h-0 flex-1" onClick={() => setOpen(null)}>
              <motion.div key={current.id} className="absolute inset-4 lg:inset-10" initial={reduce ? false : { opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                <Image src={current.image} alt={current.alt[lang]} fill sizes="(min-width: 1024px) 70vw, 100vw" className="object-contain" quality={80} />
              </motion.div>
            </div>
            <aside className="flex shrink-0 flex-col gap-5 border-t border-line bg-ink p-5 lg:w-[22rem] lg:border-t-0 lg:border-l lg:p-8">
              <div className="flex items-center justify-between">
                <p className="text-[0.8125rem] text-ash">
                  {(open ?? 0) + 1} / {list.length}
                </p>
                <button type="button" onClick={() => setOpen(null)} className="grid size-11 place-items-center text-bone hover:text-gold" aria-label={t.close} autoFocus>
                  <CloseIcon className="size-5" />
                </button>
              </div>
              <div>
                <p className="display text-[2rem]">{current.styles.map(styleName).join(" · ")}</p>
                <p className="mt-3 leading-relaxed text-bone/85">{current.alt[lang]}</p>
              </div>
              <dl className="grid grid-cols-2 gap-4 border-t border-line pt-5 text-[0.875rem]">
                <div>
                  <dt className="text-ash">{t.zone}</dt>
                  <dd className="mt-1">{d.zones[current.zone as keyof typeof d.zones]}</dd>
                </div>
                <div>
                  <dt className="text-ash">{d.form.colour}</dt>
                  <dd className="mt-1">{current.color ? t.color : t.bw}</dd>
                </div>
                {current.sessions && (
                  <div>
                    <dt className="text-ash">&nbsp;</dt>
                    <dd className="mt-1">{fill(t.sessions, { n: current.sessions })}</dd>
                  </div>
                )}
                {artistBySlug(current.artist) && (
                  <div>
                    <dt className="text-ash">{t.artist}</dt>
                    <dd className="mt-1">
                      <Link href={artistHref(lang, current.artist!)} className="link-line">
                        {artistName(artistBySlug(current.artist)!)}
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-auto flex items-center gap-2">
                <button type="button" onClick={() => go(-1)} className="btn-line !min-h-11 !px-4" aria-label={t.prev}>
                  <ArrowIcon className="size-4 rotate-180" />
                </button>
                <button type="button" onClick={() => go(1)} className="btn-line !min-h-11 !px-4" aria-label={t.next}>
                  <ArrowIcon className="size-4" />
                </button>
                <Link href={projectHref(lang, { style: current.styles[0], artist: current.artist ?? undefined })} className="btn-solid !min-h-11 flex-1 !px-4 !text-[0.9375rem]">
                  {t.similar}
                </Link>
              </div>
            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
