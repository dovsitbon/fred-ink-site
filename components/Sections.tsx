import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import site from "@/data/site.json";
import horaires from "@/data/horaires.json";
import piercing from "@/data/piercing.json";
import { fill, intlLocale, type Dict, type Locale } from "@/lib/i18n";
import { img } from "@/lib/media";
import { artistHref, href, projectHref, styleHref } from "@/lib/routes";
import { hourLabel, money, upcomingClosures, weekRows } from "@/lib/shop";
import { ARTISTS, PROJECTS, STYLES, artistInsta, artistName, projectsOf, type Artist } from "@/lib/data";
import { Reveal } from "@/components/Reveal";
import { OpenStatus } from "@/components/OpenStatus";
import { ArrowIcon, InstagramIcon, PhoneIcon, PinIcon, PlusIcon, StarIcon } from "@/components/icons";

type P = { lang: Locale; d: Dict };
const styleText = (d: Dict, id: string) => d.styles.items[id as keyof Dict["styles"]["items"]];

export function SectionHead({ eyebrow, title, lead, id, className = "" }: { eyebrow: string; title: string; lead?: string; id?: string; className?: string }) {
  return (
    <Reveal className={className}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="h2 mt-5">
        {title}
      </h2>
      {lead && <p className="lead mt-6 max-w-xl">{lead}</p>}
    </Reveal>
  );
}

/** Note Google, à côté des boutons. */
export function Rating({ lang, d, className = "" }: P & { className?: string }) {
  const date = new Intl.DateTimeFormat(intlLocale[lang], { month: "long", year: "numeric" }).format(new Date(site.rating.asOf));
  const value = new Intl.NumberFormat(intlLocale[lang]).format(site.rating.value);
  return (
    <a href={site.maps} target="_blank" rel="noopener" className={`group inline-flex items-center gap-3 text-[0.875rem] ${className}`} title={fill(d.rating.asOf, { date })}>
      <span className="flex gap-0.5 text-gold" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarIcon key={i} />
        ))}
      </span>
      <span>
        <strong className="font-medium text-bone">{fill(d.rating.label, { value })}</strong>
        <span className="text-ash"> · {fill(d.rating.count, { count: site.rating.count })}</span>
      </span>
    </a>
  );
}

export function Hero({ lang, d }: P) {
  const h = d.hero;
  const photo = img("/media/hero/spartiate-colisee-epaule.jpg");
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[90rem] items-end gap-10 px-5 pt-6 pb-14 sm:px-8 lg:min-h-[calc(100svh-6rem)] lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10 lg:pt-10 lg:pb-16">
        <div className="order-2 lg:order-1 lg:pb-6">
          <p className="eyebrow rise">{h.eyebrow}</p>
          <h1 id="hero-title" className="display rise mt-6 text-[clamp(3.6rem,11vw,9.5rem)]" style={{ "--d": "0.1s" } as CSSProperties}>
            {h.title}
          </h1>
          <p className="lead rise mt-7 max-w-lg" style={{ "--d": "0.2s" } as CSSProperties}>
            {h.lead}
          </p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ "--d": "0.3s" } as CSSProperties}>
            <Link href={href(lang, "project")} className="btn-solid">
              {d.nav.cta}
            </Link>
            <Link href={href(lang, "home", "artistes")} className="btn-line">
              {h.secondary}
            </Link>
          </div>
          <Rating lang={lang} d={d} className="rise mt-7" />
        </div>
        <div className="unveil relative order-1 -mx-5 aspect-[4/5] sm:mx-0 lg:order-2 lg:aspect-auto lg:h-full lg:max-h-[52rem]">
          <Image src={photo.src} alt={h.imageAlt} fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover object-[60%_30%]" quality={80} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent lg:hidden" />
        </div>
      </div>
    </section>
  );
}

/** Tuiles de styles juste après le hero. */
export function StyleTiles({ lang, d }: P) {
  return (
    <section aria-labelledby="styles-title" className="border-t border-line py-16 lg:py-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <SectionHead eyebrow={d.styles.eyebrow} title={d.styles.title} id="styles-title" />
      </div>
      <ul className="snap-row mt-10 flex gap-3 overflow-x-auto px-5 sm:px-8 lg:mx-auto lg:grid lg:max-w-[90rem] lg:grid-cols-7 lg:overflow-visible lg:px-10">
        {STYLES.map((s, i) => {
          const t = styleText(d, s.id);
          return (
            <Reveal as="li" key={s.id} delay={i * 0.05} className="w-[62vw] shrink-0 sm:w-[16rem] lg:w-auto">
              <Link href={styleHref(lang, s.id)} className="group block">
                <div className="shine tone relative aspect-[3/4]">
                  {s.image ? (
                    <Image src={s.image} alt="" fill sizes="(min-width: 1024px) 13vw, 62vw" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center border border-line bg-ink-2">
                      <span className="display text-[3.5rem] text-graphite transition-colors group-hover:text-gold" aria-hidden="true">
                        Cover
                      </span>
                    </div>
                  )}
                </div>
                <p className="nav-link mt-4 flex items-center justify-between text-bone group-hover:text-gold">
                  {t.name} <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </p>
                <p className="mt-1.5 text-[0.8125rem] leading-snug text-ash">{t.short}</p>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}

export function ArtistCard({ lang, d, a, i = 0 }: P & { a: Artist; i?: number }) {
  const name = artistName(a);
  const pieces = projectsOf(a.slug).slice(0, 3);
  const styles = a.styles.map((s) => styleText(d, s)?.name).filter(Boolean);
  return (
    <Reveal as="li" delay={(i % 3) * 0.06} className="flex flex-col border border-line bg-ink-2">
      <Link href={artistHref(lang, a.slug)} className="group block">
        <div className={`relative aspect-[3/2] overflow-hidden ${a.photo ? "shine" : "border-b border-line"}`}>
          {a.photo ? (
            <Image src={a.photo} alt={name} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <span className="display text-[7rem] leading-[0.8] text-transparent transition-colors duration-500 [-webkit-text-stroke:1px_var(--color-gold)] group-hover:text-gold" aria-hidden="true">
                {a.handle.replace(/[^a-z]/gi, "").charAt(0).toUpperCase()}
              </span>
              <span className="text-[0.75rem] tracking-[0.12em] text-ash uppercase">{d.artists.portraitSoon}</span>
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="display text-[2.25rem]">
          <Link href={artistHref(lang, a.slug)} className="hover:text-gold">
            {name}
          </Link>
        </h3>
        {a.role && <p className="mt-1 text-[0.875rem] text-ash">{a.role[lang]}</p>}
        {styles.length > 0 && <p className="mt-3 text-[0.875rem] text-bone/85">{styles.join(" · ")}</p>}
        {pieces.length > 0 && (
          <ul className="mt-5 grid grid-cols-3 gap-1.5">
            {pieces.map((p) => (
              <li key={p.id} className="shine relative aspect-square">
                <Image src={p.image} alt={p.alt[lang]} fill sizes="120px" className="object-cover" />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
          <Link href={projectHref(lang, { artist: a.slug })} className="btn-line !min-h-11 !px-4 !text-[0.9375rem] hover:!border-gold hover:!bg-gold">
            {fill(d.artists.with, { name })}
          </Link>
          <a href={artistInsta(a)} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-2 text-[0.875rem] text-ash hover:text-gold">
            <InstagramIcon /> @{a.handle}
          </a>
        </div>
      </div>
    </Reveal>
  );
}

export function Artists({ lang, d }: P) {
  return (
    <section id="artistes" aria-labelledby="artistes-title" className="border-t border-line py-20 lg:py-28">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <SectionHead eyebrow={d.artists.eyebrow} title={d.artists.title} lead={d.artists.lead} id="artistes-title" />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ARTISTS.map((a, i) => (
            <ArtistCard key={a.slug} lang={lang} d={d} a={a} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Reviews({ lang, d }: P) {
  const r = d.reviews;
  return (
    <section aria-labelledby="avis-title" className="border-t border-line bg-ink-2 py-20 lg:py-24">
      <div className="mx-auto grid max-w-[90rem] gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:px-10">
        <Reveal>
          <p className="eyebrow">{r.eyebrow}</p>
          <p className="display mt-6 text-[clamp(5rem,12vw,9rem)] text-gold">{new Intl.NumberFormat(intlLocale[lang]).format(site.rating.value)}</p>
          <Rating lang={lang} d={d} className="mt-2" />
        </Reveal>
        <div>
          <h2 id="avis-title" className="h2 !text-[clamp(2rem,4vw,3rem)]">
            {r.title}
          </h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2">
            {r.items.map((it, i) => (
              <Reveal as="li" key={it.t} delay={i * 0.08}>
                <div className="rule" />
                <p className="nav-link mt-5 text-gold">{it.t}</p>
                <p className="mt-3 leading-relaxed text-bone/85">{it.p}</p>
              </Reveal>
            ))}
          </ul>
          <a href={site.maps} target="_blank" rel="noopener" className="link-line mt-10 inline-block text-[0.9375rem]">
            {r.link}
          </a>
        </div>
      </div>
    </section>
  );
}

export function PiercingBlock({ lang, d, full = false }: P & { full?: boolean }) {
  const p = d.piercing;
  const photo = img("/media/piercing/daith-oreille.jpg");
  return (
    <section id="piercing" aria-labelledby="piercing-title" className="border-t border-line py-20 lg:py-28">
      <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <Reveal className="shine relative aspect-[4/5] lg:order-2">
          <Image src={photo.src} alt={p.imageAlt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </Reveal>
        <div className="lg:order-1">
          <SectionHead eyebrow={p.eyebrow} title={full ? p.pageTitle : p.title} lead={p.lead} id="piercing-title" />
          <ul className="mt-10 border-t border-line">
            {piercing.items.map((it) => (
              <li key={it.id} className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                <span>{it.name[lang]}</span>
                <span className="text-[0.875rem] text-ash">{it.price ? fill(p.from, { price: money(it.price, lang) }) : p.priceOnSite}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[0.9375rem] text-ash">{p.rdv}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`tel:${site.tel}`} className="btn-solid">
              <PhoneIcon /> {d.nav.call} · {site.phone}
            </a>
            {!full && (
              <Link href={href(lang, "piercing")} className="btn-line">
                {p.more}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Process({ lang, d }: P) {
  const p = d.process;
  return (
    <section aria-labelledby="process-title" className="border-t border-line py-20 lg:py-28">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <SectionHead eyebrow={p.eyebrow} title={p.title} id="process-title" />
        <ol className="mt-12 grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-5">
          {p.steps.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.07} className="bg-ink p-6 lg:p-7">
              <span className="display text-[3rem] text-gold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="nav-link mt-6 text-[1.125rem] text-bone">{s.t}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ash">{s.p}</p>
            </Reveal>
          ))}
        </ol>
        <Reveal className="mt-10">
          <Link href={href(lang, "project")} className="btn-solid">
            {d.nav.cta}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function Hygiene({ d }: { d: Dict }) {
  const h = d.hygiene;
  return (
    <section aria-labelledby="hygiene-title" className="border-t border-line bg-bone py-20 text-ink lg:py-28">
      <div className="mx-auto grid max-w-[90rem] gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.6fr] lg:px-10">
        <Reveal>
          <p className="eyebrow !text-[#7a5f1f]">{h.eyebrow}</p>
          <h2 id="hygiene-title" className="h2 mt-5">
            {h.title}
          </h2>
          <p className="mt-6 max-w-sm text-[1.0625rem] leading-relaxed text-[#4a4741]">{h.note}</p>
        </Reveal>
        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {h.items.map((it, i) => (
            <Reveal as="li" key={it.t} delay={i * 0.06}>
              <div className="h-px bg-ink/20" />
              <h3 className="nav-link mt-5 text-[1.125rem]">{it.t}</h3>
              <p className="mt-3 leading-relaxed text-[#4a4741]">{it.p}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Advice({ d }: { d: Dict }) {
  const a = d.advice;
  return (
    <section id="conseils" aria-labelledby="conseils-title" className="border-t border-line py-20 lg:py-28">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <SectionHead eyebrow={a.eyebrow} title={a.title} id="conseils-title" />
        <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-14">
          {a.groups.map((g, i) => (
            <Reveal key={g.t} delay={i * 0.08}>
              <div className="rule" />
              <h3 className="display mt-6 text-[1.75rem]">{g.t}</h3>
              <ul className="mt-5 space-y-3">
                {g.items.map((it) => (
                  <li key={it} className="flex gap-3 leading-relaxed text-bone/85">
                    <span className="mt-[0.7em] h-px w-3 shrink-0 bg-gold" aria-hidden="true" />
                    {it}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Studio({ lang, d }: P) {
  const s = d.studio;
  const photo = img("/media/studio/devanture-rue-general-leclerc.jpg");
  return (
    <section id="studio" aria-labelledby="studio-title" className="border-t border-line py-20 lg:py-28">
      <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <Reveal className="shine relative aspect-[4/5] max-h-[44rem]">
          <Image src={photo.src} alt={s.imageAlt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover object-top" />
        </Reveal>
        <div>
          <SectionHead eyebrow={s.eyebrow} title={s.title} />
          <div className="mt-7 max-w-lg space-y-5 leading-relaxed text-bone/85">
            {s.text.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
          <Link href={href(lang, "home", "infos")} className="btn-line mt-9">
            {s.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

const INSTA = ["scolopendre-lys-rouges", "temple-zeus-belier-avant-bras", "papillons-dos-nuque", "chicano-hope-avant-bras", "manchettes-japonaises", "pivoine-ornement-avant-bras", "oni-epaule-bras", "lapin-lavande-avant-bras"];

export function InstaGrid({ lang, d }: P) {
  const items = INSTA.map((id) => PROJECTS.find((p) => p.id === id)!).filter(Boolean);
  return (
    <section aria-labelledby="insta-title" className="border-t border-line py-20 lg:py-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow={d.insta.eyebrow} title={d.insta.title} id="insta-title" />
          <a href={site.instagram} target="_blank" rel="noopener" className="btn-line">
            <InstagramIcon /> {fill(d.insta.follow, { handle: site.instagramHandle })}
          </a>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {items.map((p) => (
            <li key={p.id}>
              <a href={site.instagram} target="_blank" rel="noopener" className="shine tone relative block aspect-square" aria-label={`${p.alt[lang]} (Instagram)`}>
                <Image src={p.image} alt="" fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Infos({ lang, d }: P) {
  const i = d.infos;
  const today = new Date().toISOString().slice(0, 10);
  const closures = upcomingClosures(today);
  return (
    <section id="infos" aria-labelledby="infos-title" className="border-t border-line bg-ink-2 py-20 lg:py-28">
      <div className="mx-auto grid max-w-[90rem] gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:px-10">
        <div>
          <SectionHead eyebrow={i.eyebrow} title={i.title} id="infos-title" />
          <OpenStatus className="mt-6 text-[0.9375rem]" />
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="nav-link text-ash">{i.address}</h3>
              <address className="mt-3 leading-relaxed not-italic">
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.city}
              </address>
              <a href={site.maps} target="_blank" rel="noopener" className="link-line mt-3 inline-flex items-center gap-2 text-[0.9375rem] text-gold">
                <PinIcon /> {i.directions}
              </a>
            </div>
            <div>
              <h3 className="nav-link text-ash">{i.phone}</h3>
              <a href={`tel:${site.tel}`} className="display mt-3 block text-[2rem] hover:text-gold">
                {site.phone}
              </a>
              <p className="mt-2 text-[0.875rem] text-ash">{i.rdv}</p>
            </div>
            <div className="sm:col-span-2">
              <h3 className="nav-link text-ash">{i.access}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-bone/85">{i.accessText}</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="nav-link text-ash">{i.hours}</h3>
          <table className="mt-4 w-full text-[1rem]">
            <tbody>
              {weekRows().map((r) => (
                <tr key={r.day} className="border-b border-line">
                  <th scope="row" className="py-3.5 text-left font-normal capitalize">
                    {d.days[r.day]}
                  </th>
                  <td className={`py-3.5 text-right ${r.ranges ? "" : "text-ash"}`}>{r.ranges ? r.ranges.map(([a, b]) => `${hourLabel(a, lang)} – ${hourLabel(b, lang)}`).join(", ") : i.closed}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {closures.length > 0 && (
            <p className="mt-5 text-[0.875rem] text-ash">
              {i.closures} :{" "}
              {closures
                .map((c) => `${c.label[lang]} (${new Intl.DateTimeFormat(intlLocale[lang], { day: "numeric", month: "long" }).format(new Date(c.from))})`)
                .join(", ")}
            </p>
          )}
          <p className="sr-only">{horaires.timezone}</p>
        </div>
      </div>
    </section>
  );
}

export function Faq({ d, items = d.faq.items }: { d: Dict; items?: { q: string; a: string }[] }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line py-20 lg:py-28">
      <div className="mx-auto grid max-w-[90rem] gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.6fr] lg:px-10">
        <SectionHead eyebrow={d.faq.eyebrow} title={d.faq.title} id="faq-title" />
        <div className="border-t border-line">
          {items.map((f) => (
            <details key={f.q} className="group border-b border-line">
              <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-6 py-4 text-[1.0625rem] font-medium hover:text-gold">
                {f.q}
                <PlusIcon className="faq-plus size-4 shrink-0 text-gold transition-transform duration-300" />
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-bone/80">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Bandeau final : un seul bouton. */
export function CtaBand({ lang, d, title, query }: P & { title?: string; query?: { artist?: string; style?: string } }) {
  return (
    <section className="border-t border-line py-20 lg:py-24">
      <Reveal className="mx-auto flex max-w-[90rem] flex-col items-start gap-8 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <p className="display max-w-3xl text-[clamp(2.75rem,7vw,5.5rem)]">{title ?? d.hero.title}</p>
        <div className="flex flex-col items-start gap-4">
          <Link href={projectHref(lang, query)} className="btn-solid">
            {d.nav.cta}
          </Link>
          <a href={`tel:${site.tel}`} className="inline-flex items-center gap-2 text-[0.9375rem] text-ash hover:text-gold">
            <PhoneIcon /> {d.form.callInstead} {site.phone}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
