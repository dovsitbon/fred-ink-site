import site from "@/data/site.json";
import horaires from "@/data/horaires.json";
import { getDict, type Locale } from "@/lib/i18n";
import { href, styleHref } from "@/lib/routes";
import { ARTISTS, STYLES, artistInsta } from "@/lib/data";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const BUSINESS_ID = `${site.url}/#studio`;

/** Schema.org TattooParlor : adresse, horaires, note Google datée, styles proposés, Instagram du studio et des artistes. */
export function businessJsonLd(lang: Locale) {
  const d = getDict(lang);
  const week = horaires.week as unknown as Record<string, [string, string][] | null>;
  const hours = Object.entries(week).flatMap(([day, ranges]) => (ranges ?? []).map(([opens, closes]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: DAYS[Number(day)], opens, closes })));
  const styles = d.styles.items as Record<string, { title: string }>;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["TattooParlor", "LocalBusiness"],
        "@id": BUSINESS_ID,
        name: site.name,
        alternateName: ["Fred-Ink Tattoo", "Fred Ink Tattoo Amiens"],
        description: d.meta.description,
        url: `${site.url}/${lang}`,
        image: [`${site.url}/og.jpg`, `${site.url}/media/studio/devanture-rue-general-leclerc.jpg`],
        logo: `${site.url}/logo.svg`,
        telephone: site.phoneIntl,
        priceRange: "€€",
        currenciesAccepted: "EUR",
        foundingDate: String(site.team.since),
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          postalCode: site.address.postalCode,
          addressLocality: site.address.city,
          addressRegion: site.address.region,
          addressCountry: site.address.country,
        },
        hasMap: site.maps,
        openingHoursSpecification: hours,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: site.rating.value,
          reviewCount: site.rating.count,
          bestRating: 5,
          worstRating: 1,
          description: `Google, ${site.rating.asOf}`,
        },
        areaServed: { "@type": "City", name: "Amiens" },
        sameAs: [site.instagram, site.facebook, site.tiktok, ...ARTISTS.map(artistInsta)],
        makesOffer: [
          ...STYLES.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: styles[s.id].title, url: `${site.url}${styleHref(lang, s.id)}` } })),
          { "@type": "Offer", itemOffered: { "@type": "Service", name: d.piercing.pageTitle, url: `${site.url}${href(lang, "piercing")}` } },
        ],
      },
      { "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.name, inLanguage: ["fr", "en"], publisher: { "@id": BUSINESS_ID } },
    ],
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function breadcrumbJsonLd(lang: Locale, trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Fred-Ink", path: `/${lang}` }, ...trail].map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: `${site.url}${t.path}` })),
  };
}
