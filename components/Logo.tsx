import paths from "@/components/logo-paths.json";

/**
 * Le vrai logo de Fred-Ink (« FRED-INK » / « TATTOO STUDIO »), vectorisé depuis sa photo de profil par scripts/logo.mjs.
 * Prend la couleur du texte (currentColor). Pour le remplacer par le fichier d'origine : components/logo-paths.json et public/logo.svg.
 */
export function Logo({ className = "", title, word = false }: { className?: string; title?: string; word?: boolean }) {
  const [, y, w, h] = paths.wordBox;
  const vb = word ? `0 ${y - 18} ${w} ${h + 36}` : paths.viewBox;
  return (
    <svg viewBox={vb} className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} fill="currentColor">
      <path fillRule="evenodd" d={paths.word} />
      {!word && <path fillRule="evenodd" d={paths.sub} />}
    </svg>
  );
}
