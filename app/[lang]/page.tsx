import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { faqJsonLd } from "@/lib/jsonld";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Advice, Artists, CtaBand, Faq, Hero, Hygiene, Infos, InstaGrid, PiercingBlock, Process, Reviews, SectionHead, Studio, StyleTiles } from "@/components/Sections";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(d.faq.items)) }} />
      <Hero lang={lang} d={d} />
      <StyleTiles lang={lang} d={d} />
      <Artists lang={lang} d={d} />
      <section id="projets" aria-labelledby="projets-title" className="border-t border-line py-20 lg:py-28">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
          <SectionHead eyebrow={d.projects.eyebrow} title={d.projects.title} lead={d.projects.lead} id="projets-title" className="mb-10" />
          <ProjectGrid />
        </div>
      </section>
      <Reviews lang={lang} d={d} />
      <PiercingBlock lang={lang} d={d} />
      <Process lang={lang} d={d} />
      <Hygiene d={d} />
      <Advice d={d} />
      <Studio lang={lang} d={d} />
      <InstaGrid lang={lang} d={d} />
      <Infos lang={lang} d={d} />
      <Faq d={d} />
      <CtaBand lang={lang} d={d} />
    </>
  );
}
