"use client";

import { useEffect, useState } from "react";
import paths from "@/components/logo-paths.json";

const KEY = "fredink-intro";

/**
 * Ouverture (1,5 s, une fois par session), tout en CSS (globals.css) : écran noir, un fin trait d'encre dessine
 * le contour de « FRED-INK » (le vrai lettrage du logo), le mot se remplit d'or, une goutte d'encre tombe et
 * s'étale, puis fondu sur le hero. Ignorée si l'utilisateur préfère réduire les animations (script du layout).
 */
export function Intro({ skipLabel }: { skipLabel: string }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      document.documentElement.classList.add("intro-seen");
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;
  const [, y, w, h] = paths.wordBox;

  return (
    <div className="intro-curtain grid place-items-center">
      <svg viewBox={`0 ${y - 40} ${w} ${h + 260}`} className="w-[min(72vw,30rem)]" aria-hidden="true">
        <path className="intro-word" pathLength={1} fillRule="evenodd" d={paths.word} vectorEffect="non-scaling-stroke" />
        {/* La goutte tombe sous le trait d'union, puis s'étale */}
        <g transform={`translate(${w * 0.515} ${y + h + 150})`}>
          <path className="intro-drop" d="M0 -64C0 -64 -22 -36 -22 -20A22 22 0 0 0 22 -20C22 -36 0 -64 0 -64Z" fill="var(--color-gold)" />
          <ellipse className="intro-splash" cx="0" cy="-2" rx="200" ry="200" fill="var(--color-gold)" />
        </g>
      </svg>
      <button
        type="button"
        onClick={() => {
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {}
          document.documentElement.classList.add("intro-seen");
          setGone(true);
        }}
        className="nav-link absolute right-4 bottom-4 min-h-11 px-4 text-ash transition-colors hover:text-bone"
      >
        {skipLabel}
      </button>
    </div>
  );
}
