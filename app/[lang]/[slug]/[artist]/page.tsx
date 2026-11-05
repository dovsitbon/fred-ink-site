import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import site from "@/data/site.json";
import { fill, getDict, isLocale, locales, ogLocale, type Locale } from "@/lib/i18n";
import { ARTISTS_DIR, artistHref, href, projectHref, styleHref } from "@/lib/routes";
import { ARTISTS, artistBySlug, artistInsta, artistName, projectsOf } from "@/lib/data";
import { BUSINESS_ID, breadcrumbJsonLd } from "@/lib/jsonld";
import { ProjectGrid } from "@/components/ProjectGrid";
import { ArtistCard, CtaBand, Rating } from "@/components/Sections";
import { ArrowIcon, InstagramIcon } from "@/components/icons";

export function generateStaticParams() {
  return locales.flatMap((lang) => ARTISTS.map((a) => ({ lang, slug: ARTISTS_DIR[lang], artist: a.slug })));
}
export const dynamicParams = false;

function load(lang: string, slug: string, artist: string) {
  if (!isLocale(lang) || ARTISTS_DIR[lang] !== slug) return null;
  const a = artistBySlug(artist);
  return a ? { lang: lang as Locale, a } : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]/[artist]">): Promise<Metadata> {
  const { lang, slug, artist } = await params;
  const r = load(lang, slug, artist);
  if (!r) return {};
  const d = getDict(r.lang);
  const name = artistName(r.a);
  const paths = Object.fromEntries(locales.map((l) => [l, artistHref(l, r.a.slug)]));
  const title = fill(d.artists.pageMetaTitle, { name });
  const description = fill(d.artists.pageMetaDesc, { name });
  return {
    title,
    description,
    alternates: { canonical: paths[r.lang], languages: { ...paths, "x-default": paths.fr } },
    openGraph: { type: "profile", url: paths[r.lang], siteName: site.name, title, description, locale: ogLocale[r.lang], images: [{ url: r.a.photo ?? "/og.jpg" }] },
  };
}

export default async function ArtistPage({ params }: PageProps<"/[lang]/[slug]/[artist]">) {
  const { lang: l, slug, artist } = await params;
  const r = load(l, slug, artist);
  if (!r) notFound();
  const { lang, a } = r;
  const d = getDict(lang);
  const name = artistName(a);
  const pieces = projectsOf(a.slug);
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    alternateName: `@${a.handle}`,
    jobTitle: lang === "fr" ? "Tatoueur" : "Tattoo artist",
    worksFor: { "@id": BUSINESS_ID },
    sameAs: [artistInsta(a)],
    url: `${site.url}${artistHref(lang, a.slug)}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(lang, [{ name: d.artists.title, path: href(lang, "home", "artistes") }, { name, path: artistHref(lang, a.slug) }])) }} />
      <header className="mx-auto grid max-w-[90rem] gap-10 px-5 pt-10 pb-14 sm:px-8 lg:grid-cols-[1.3fr_1fr] lg:px-10 lg:pt-16">
        <div>
          <Link href={href(lang, "home", "artistes")} className="nav-link inline-flex min-h-11 items-center gap-2 text-ash hover:text-gold">
            <ArrowIcon className="size-4 rotate-180" /> {d.artists.back}
          </Link>
          <p className="eyebrow rise mt-6">{a.role?.[lang] ?? d.artists.eyebrow}</p>
          <h1 className="display rise mt-5 text-[clamp(3.5rem,10vw,8rem)]">{name}</h1>
          <p className="lead rise mt-6 max-w-xl">{a.bio?.[lang] ?? fill(d.artists.pageLead, { name })}</p>
          {a.styles.length > 0 && (
            <ul className="rise mt-6 flex flex-wrap gap-2">
              {a.styles.map((s) => (
                <li key={s}>
                  <Link href={styleHref(lang, s)} className="chip">
                    {d.styles.items[s as keyof typeof d.styles.items].name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="rise mt-9 flex flex-wrap items-center gap-3">
            <Link href={projectHref(lang, { artist: a.slug })} className="btn-solid">
              {fill(d.artists.with, { name })}
            </Link>
            <a href={artistInsta(a)} target="_blank" rel="noopener" className="btn-line">
              <InstagramIcon /> @{a.handle}
            </a>
          </div>
          <Rating lang={lang} d={d} className="rise mt-7" />
        </div>
        <div className="relative aspect-[4/5] max-h-[36rem] overflow-hidden border border-line bg-ink-2">
          {a.photo ? (
            <Image src={a.photo} alt={name} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col justify-between p-8">
              <span className="display text-[14rem] leading-[0.8] text-transparent [-webkit-text-stroke:1px_var(--color-gold)]" aria-hidden="true">
                {a.handle.replace(/[^a-z]/gi, "").charAt(0).toUpperCase()}
              </span>
              <span className="text-[0.75rem] tracking-[0.12em] text-ash uppercase">{d.artists.portraitSoon}</span>
            </div>
          )}
        </div>
      </header>
      <section aria-labelledby="work-title" className="border-t border-line py-16 lg:py-20">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
          <h2 id="work-title" className="h2 !text-[clamp(2rem,4vw,3rem)]">
            {d.artists.pieces}
          </h2>
          {pieces.length ? (
            <div className="mt-8">
              <ProjectGrid items={pieces} filters={false} />
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-bone/85">{d.artists.noPieces}</p>
              <a href={artistInsta(a)} target="_blank" rel="noopener" className="btn-line mt-6">
                <InstagramIcon /> {d.artists.instagram} · @{a.handle}
              </a>
            </div>
          )}
        </div>
      </section>
      <section aria-labelledby="others-title" className="border-t border-line py-16 lg:py-20">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
          <h2 id="others-title" className="h2 !text-[clamp(2rem,4vw,3rem)]">
            {d.artists.others}
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ARTISTS.filter((x) => x.slug !== a.slug)
              .slice(0, 3)
              .map((x, i) => (
                <ArtistCard key={x.slug} lang={lang} d={d} a={x} i={i} />
              ))}
          </ul>
        </div>
      </section>
      <CtaBand lang={lang} d={d} title={fill(d.artists.with, { name })} query={{ artist: a.slug }} />
    </>
  );
}
