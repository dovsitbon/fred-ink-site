"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers";
import { CloseIcon } from "@/components/icons";
import { activeAnnouncement, parisNow } from "@/lib/shop";
import { href } from "@/lib/routes";

const KEY = "fredink-annonce";

/** Bandeau d'infos pratiques (data/annonces.json : soirée, guest, flash, sinon agenda ouvert / complet), qu'on peut fermer. */
export function AnnounceBar() {
  const { lang, d } = useLocale();
  const [a, setA] = useState<ReturnType<typeof activeAnnouncement> | null>(null);

  useEffect(() => {
    const next = activeAnnouncement(parisNow().iso);
    let closed = false;
    try {
      closed = localStorage.getItem(KEY) === next.id;
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage, lisible seulement après hydratation
    setA(closed ? null : next);
  }, []);

  if (!a) return null;

  const close = () => {
    try {
      localStorage.setItem(KEY, a.id);
    } catch {}
    setA(null);
  };

  let text: string;
  let link: { label: string; to: string; ext: boolean };
  if (a.kind === "item") {
    text = a.text[lang];
    const ext = a.href.startsWith("http");
    link = { label: a.link[lang], to: ext ? a.href : href(lang, "project"), ext };
  } else {
    text = a.status === "complet" ? d.announce.agendaFull : a.text[lang];
    link = { label: d.nav.cta, to: href(lang, "project"), ext: false };
  }

  return (
    <div className="fade-in relative border-b border-line bg-ink-2 text-bone">
      <p className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-12 py-2.5 text-center text-[0.8125rem] leading-snug">
        <span className={`size-1.5 shrink-0 rounded-full ${a.kind === "agenda" && a.status === "complet" ? "bg-ash" : "bg-gold"}`} aria-hidden="true" />
        <span>
          {text}{" "}
          {link.ext ? (
            <a href={link.to} target="_blank" rel="noopener" className="link-line ms-1 whitespace-nowrap text-gold">
              {link.label}
            </a>
          ) : (
            <Link href={link.to} className="link-line ms-1 whitespace-nowrap text-gold">
              {link.label}
            </Link>
          )}
        </span>
      </p>
      <button type="button" onClick={close} aria-label={d.announce.close} className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center text-ash hover:text-bone">
        <CloseIcon />
      </button>
    </div>
  );
}
