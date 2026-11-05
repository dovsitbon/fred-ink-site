import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import site from "@/data/site.json";
import { fill, getDict, isLocale, locales, ogLocale, type Dict, type Locale } from "@/lib/i18n";
import { allSlugs, href, projectHref, resolveSlug, styleHref, type PageId } from "@/lib/routes";
import { STYLES, projectsInStyle } from "@/lib/data";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/jsonld";
import { ProjectGrid } from "@/components/ProjectGrid";
import { ProjectForm } from "@/components/ProjectForm";
import { Reveal } from "@/components/Reveal";
import { CtaBand, Faq, PiercingBlock, Rating } from "@/components/Sections";
import { ArrowIcon, InstagramIcon, PhoneIcon } from "@/components/icons";

export function generateStaticParams() {
  return locales.flatMap((lang) => allSlugs(lang).map((slug) => ({ lang, slug })));
}
export const dynamicParams = false;

type Info = { title: string; description: string; paths: Record<Locale, string> };

function info(lang: Locale, slug: string): Info | null {
  const r = resolveSlug(lang, slug);
  if (!r) return null;
  const d = getDict(lang);
  if (r.kind === "style") {
    const t = d.styles.items[r.id as keyof Dict["styles"]["items"]];
    return { title: t.metaTitle, description: t.metaDesc, paths: Object.fromEntries(locales.map((l) => [l, styleHref(l, r.id)])) as Record<Locale, string> };
  }
  const paths = Object.fromEntries(locales.map((l) => [l, href(l, r.id)])) as Record<Locale, string>;
  if (r.id === "project") return { title: d.form.metaTitle, description: d.form.metaDesc, paths };
  if (r.id === "piercing") return { title: d.piercing.pageMetaTitle, description: d.piercing.pageMetaDesc, paths };
  return { title: `${d.legal.title} | ${site.name}`, description: d.legal.metaDesc, paths };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const i = info(lang, slug);
  if (!i) return {};
  const d = getDict(lang);
  return {
    title: i.title,
    description: i.description,
    alternates: { canonical: i.paths[lang], languages: { ...i.paths, "x-default": i.paths.fr } },
    openGraph: { type: "website", url: i.paths[lang], siteName: site.name, title: i.title, description: i.description, locale: ogLocale[lang], images: [{ url: "/og.jpg", width: 1200, height: 630, alt: d.meta.ogAlt }] },
    robots: resolveSlug(lang, slug)?.id === "legal" ? { index: false, follow: true } : undefined,
  };
}

export default async function Page({ params }: PageProps<"/[lang]/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const r = resolveSlug(lang, slug);
  if (!r) notFound();
  const d = getDict(lang);
  if (r.kind === "style") return <StylePage lang={lang} d={d} id={r.id} />;
  const pages: Record<PageId, () => React.ReactNode> = {
    project: () => <ProjectPage d={d} />,
    piercing: () => <PiercingPage lang={lang} d={d} />,
    legal: () => <LegalPage d={d} />,
  };
  return pages[r.id]();
}

function PageHead({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <header className="mx-auto max-w-[90rem] px-5 pt-10 pb-12 sm:px-8 lg:px-10 lg:pt-16 lg:pb-16">
      <p className="eyebrow rise">{eyebrow}</p>
      <h1 className="display rise mt-6 max-w-5xl text-[clamp(3rem,9vw,7.5rem)]">{title}</h1>
      {lead && <p className="lead rise mt-7 max-w-2xl">{lead}</p>}
      {children}
    </header>
  );
}

function StylePage({ lang, d, id }: { lang: Locale; d: Dict; id: string }) {
  const t = d.styles.items[id as keyof Dict["styles"]["items"]];
  const pieces = projectsInStyle(id);
  const s = STYLES.find((x) => x.id === id)!;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(lang, [{ name: t.title, path: styleHref(lang, id) }])) }} />
      <PageHead eyebrow={d.styles.eyebrow} title={t.title} lead={t.intro}>
        <div className="rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link href={projectHref(lang, { style: id })} className="btn-solid">
            {fill(d.styleNav.cta, { style: t.name.toLowerCase() })}
          </Link>
          <Rating lang={lang} d={d} />
        </div>
      </PageHead>
      <section className="border-t border-line py-16 lg:py-20">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-5 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:px-10">
          <div className="max-w-2xl space-y-6 text-[1.0625rem] leading-relaxed text-bone/85">
            {t.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {s.image && (
            <Reveal className="shine relative hidden aspect-[4/5] lg:block">
              <Image src={s.image} alt={pieces[0]?.alt[lang] ?? t.name} fill sizes="35vw" className="object-cover" />
            </Reveal>
          )}
        </div>
      </section>
      <section aria-labelledby="pieces-title" className="border-t border-line py-16 lg:py-20">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
          <h2 id="pieces-title" className="h2 !text-[clamp(2rem,4vw,3rem)]">
            {d.styleNav.pieces}
          </h2>
          {pieces.length ? (
            <div className="mt-8">
              <ProjectGrid items={pieces} filters={false} limit={8} />
            </div>
          ) : (
            <div className="mt-8 max-w-xl">
              <p className="text-bone/85">{d.styleNav.none}</p>
              <a href={site.instagram} target="_blank" rel="noopener" className="btn-line mt-6">
                <InstagramIcon /> {site.instagramHandle}
              </a>
            </div>
          )}
        </div>
      </section>
      <nav aria-labelledby="others-title" className="border-t border-line py-16">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
          <h2 id="others-title" className="nav-link text-ash">
            {d.styleNav.others}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {STYLES.filter((x) => x.id !== id).map((x) => (
              <li key={x.id}>
                <Link href={styleHref(lang, x.id)} className="chip">
                  {d.styles.items[x.id as keyof Dict["styles"]["items"]].name}
                </Link>
              </li>
            ))}
            <li>
              <Link href={href(lang, "piercing")} className="chip">
                {d.nav.piercing}
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <Faq d={d} items={d.faq.items.slice(0, 4)} />
      <CtaBand lang={lang} d={d} query={{ style: id }} />
    </>
  );
}

function ProjectPage({ d }: { d: Dict }) {
  return (
    <>
      <PageHead eyebrow={d.form.eyebrow} title={d.form.title} lead={d.form.lead}>
        <a href={`tel:${site.tel}`} className="rise mt-7 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] text-ash hover:text-gold">
          <PhoneIcon /> {d.form.callInstead} <span className="text-bone">{site.phone}</span>
        </a>
      </PageHead>
      <section className="border-t border-line pt-12 pb-24 lg:pt-16">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
          <ProjectForm />
        </div>
      </section>
    </>
  );
}

function PiercingPage({ lang, d }: { lang: Locale; d: Dict }) {
  const p = d.piercing;
  const faq = d.faq.items.filter((_, i) => i === 2 || i === 6);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(lang, [{ name: p.pageTitle, path: href(lang, "piercing") }])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }} />
      <h1 className="sr-only">{p.pageTitle}</h1>
      <PiercingBlock lang={lang} d={d} full />
      <section className="border-t border-line py-20 lg:py-24">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <Reveal>
            <h2 className="display text-[2.25rem]">{p.jewels}</h2>
            <p className="mt-5 max-w-lg leading-relaxed text-bone/85">{p.jewelsText}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display text-[2.25rem]">{p.care}</h2>
            <ul className="mt-5 space-y-3">
              {p.careItems.map((it) => (
                <li key={it} className="flex gap-3 leading-relaxed text-bone/85">
                  <span className="mt-[0.7em] h-px w-3 shrink-0 bg-gold" aria-hidden="true" />
                  {it}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[0.9375rem] text-ash">{p.healing}</p>
          </Reveal>
        </div>
      </section>
      <Faq d={d} items={faq} />
      <section className="border-t border-line py-16">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
          <Link href={href(lang, "home", "artistes")} className="link-line inline-flex items-center gap-2 text-gold">
            {d.hero.secondary} <ArrowIcon />
          </Link>
        </div>
      </section>
    </>
  );
}

function LegalPage({ d }: { d: Dict }) {
  const l = d.legal;
  return (
    <>
      <PageHead eyebrow="Fred-Ink" title={l.title} />
      <section className="border-t border-line py-16 lg:py-20">
        <div className="mx-auto max-w-3xl space-y-10 px-5 leading-relaxed text-bone/85 sm:px-8">
          <div>
            <h2 className="display text-[1.75rem] text-bone">{l.editor}</h2>
            <p className="mt-3">{l.editorText}</p>
            {(site.legal.siret ? <p className="mt-2">SIRET : {site.legal.siret}</p> : <p className="mt-2 text-ash">{l.pending}</p>)}
          </div>
          <div>
            <h2 className="display text-[1.75rem] text-bone">{l.host}</h2>
            <p className="mt-3">{site.legal.host}</p>
          </div>
          <div>
            <h2 className="display text-[1.75rem] text-bone">{l.data}</h2>
            <p className="mt-3">{l.dataText}</p>
          </div>
          <div>
            <h2 className="display text-[1.75rem] text-bone">{l.photos}</h2>
            <p className="mt-3">{l.photosText}</p>
          </div>
        </div>
      </section>
    </>
  );
}
