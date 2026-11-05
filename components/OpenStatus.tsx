"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers";
import { fill } from "@/lib/i18n";
import { hourLabel, openStatus, type OpenStatus as S } from "@/lib/shop";

/** « Ouvert maintenant, jusqu'à 18 h 45 » / « Fermé, réouverture mardi à 9 h », calculé en direct (heure de Paris). */
export function OpenStatus({ className = "" }: { className?: string }) {
  const { lang, d } = useLocale();
  const [s, setS] = useState<S | null>(null);

  useEffect(() => {
    const tick = () => setS(openStatus());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!s) return <span className={`inline-block min-h-[1.5em] ${className}`} aria-hidden="true" />;

  const t = d.status;
  let text: string;
  if (s.open) text = `${t.open}, ${fill(t.until, { time: hourLabel(s.until, lang) })}`;
  else if (s.nextDay === null) text = t.closed;
  else {
    const day = s.offset === 0 ? t.today : s.offset === 1 ? t.tomorrow : d.days[s.nextDay];
    text = `${t.closed}, ${fill(t.reopens, { day, time: hourLabel(s.at, lang) })}`;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`size-1.5 rounded-full ${s.open ? "bg-gold" : "bg-ash"}`} aria-hidden="true" />
      {text}
    </span>
  );
}
