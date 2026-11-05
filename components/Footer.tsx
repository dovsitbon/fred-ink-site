import Link from "next/link";
import site from "@/data/site.json";
import type { Dict, Locale } from "@/lib/i18n";
import { artistHref, href, styleHref } from "@/lib/routes";
import { hourLabel } from "@/lib/shop";
import { ARTISTS, STYLES, artistInsta, artistName } from "@/lib/data";
import { Logo } from "@/components/Logo";
import { InstagramIcon } from "@/components/icons";

export function Footer({ lang, d }: { lang: Locale; d: Dict }) {
  const f = d.footer;
  return (
    <footer className="border-t border-line bg-ink pb-28 text-bone/85 lg:pb-0">
      <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] lg:px-10 lg:py-20">
        <div>
          <Logo className="h-14 w-auto text-gold" title="Fred-Ink Tattoo Studio" />
          <p className="mt-6 max-w-xs text-[0.9375rem] leading-relaxed text-ash">{f.tagline}</p>
          <Link href={href(lang, "project")} className="btn-solid mt-8">
            {d.nav.cta}
          </Link>
        </div>
        <div>
          <p className="eyebrow">{f.contact}</p>
          <address className="mt-4 text-[0.9375rem] leading-relaxed not-italic">
            {site.address.street}
            <br />
            {site.address.postalCode} {site.address.city}
            <br />
            <a href={`tel:${site.tel}`} className="mt-3 inline-block hover:text-gold">
              {site.phone}
            </a>
          </address>
        </div>
        <div>
          <p className="eyebrow">{f.hours}</p>
          <p className="mt-4 text-[0.9375rem] leading-relaxed">
            {f.days}
            <br />
            {hourLabel("10:00", lang)} – {hourLabel("18:30", lang)}
            <br />
            {f.saturday}
            <br />
            {hourLabel("09:30", lang)} – {hourLabel("18:00", lang)}
            <br />
            <span className="text-ash">{f.closed}</span>
          </p>
        </div>
        <div>
          <p className="eyebrow">{f.artists}</p>
          <ul className="mt-4 space-y-2 text-[0.9375rem]">
            {ARTISTS.map((a) => (
              <li key={a.slug} className="flex items-center gap-2">
                <Link href={artistHref(lang, a.slug)} className="hover:text-gold">
                  {artistName(a)}
                </Link>
                <a href={artistInsta(a)} target="_blank" rel="noopener" aria-label={`Instagram @${a.handle}`} className="grid size-8 place-items-center text-ash hover:text-gold">
                  <InstagramIcon className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">{f.styles}</p>
          <ul className="mt-4 space-y-2 text-[0.9375rem]">
            {STYLES.map((s) => (
              <li key={s.id}>
                <Link href={styleHref(lang, s.id)} className="hover:text-gold">
                  {d.styles.items[s.id as keyof typeof d.styles.items].title}
                </Link>
              </li>
            ))}
            <li>
              <Link href={href(lang, "piercing")} className="hover:text-gold">
                {d.piercing.pageTitle}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-6 text-[0.8125rem] text-ash sm:px-8 lg:px-10">
        <p>
          © {new Date().getFullYear()} {f.rights}
        </p>
        <div className="flex items-center gap-6">
          <a href={site.instagram} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-bone">
            <InstagramIcon /> {site.instagramHandle}
          </a>
          <Link href={href(lang, "legal")} className="hover:text-bone">
            {f.legal}
          </Link>
        </div>
      </div>
    </footer>
  );
}
