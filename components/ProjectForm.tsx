"use client";

import { useEffect, useRef, useState } from "react";
import site from "@/data/site.json";
import { useLocale } from "@/components/providers";
import { CloseIcon, InstagramIcon, PhoneIcon, PlusIcon } from "@/components/icons";
import { fill } from "@/lib/i18n";
import { ARTISTS, STYLES, artistBySlug, artistInsta, artistName } from "@/lib/data";
import { BUDGETS, COLOURS, KINDS, SIZES, emptyRequest, isMinor, validate, type Errors, type ProjectRequest } from "@/lib/project";

type Photo = { name: string; data: string; preview: string };
type Sent = { notified: boolean; confirmed: boolean };

/** Réduit une photo à 1600 px de côté en JPEG (≈ 300 Ko) avant l'envoi : l'API reste sous la limite de Vercel. */
async function shrink(file: File): Promise<Photo> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const url = c.toDataURL("image/jpeg", 0.8);
  return { name: file.name.replace(/\.[^.]+$/, "") + ".jpg", data: url.split(",")[1], preview: url };
}

export function ProjectForm() {
  const { lang, d } = useLocale();
  const f = d.form;
  const [q, setQ] = useState<ProjectRequest>(emptyRequest);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<Errors>({});
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoError, setPhotoError] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);
  const top = useRef<HTMLDivElement>(null);

  // Pré-remplissage depuis « Un projet avec … » ou « Un projet dans ce style » (?artist=…&style=…)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const artist = p.get("artist") ?? "";
    const style = p.get("style") ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture de l'URL après hydratation
    setQ((v) => ({
      ...v,
      artist: artistBySlug(artist) ? artist : "",
      style: STYLES.some((s) => s.id === style) ? style : "",
      kind: style === "cover" ? "cover" : v.kind,
    }));
  }, []);

  const set = <K extends keyof ProjectRequest>(k: K, v: ProjectRequest[K]) => setQ((x) => ({ ...x, [k]: v }));
  const scrollTop = () => top.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const next = () => {
    const e = validate(q, step);
    setErrors(e);
    if (Object.keys(e).length) return;
    setStep((s) => (s < 3 ? ((s + 1) as 2 | 3) : s));
    scrollTop();
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    setPhotoError(false);
    const room = 3 - photos.length;
    const out: Photo[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      try {
        out.push(await shrink(file));
      } catch {
        setPhotoError(true);
      }
    }
    setPhotos((p) => [...p, ...out].slice(0, 3));
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (step < 3) return next();
    const e = validate(q, "all");
    setErrors(e);
    if (Object.keys(e).length) {
      if (e.idea) setStep(1);
      else if (e.zone || e.size) setStep(2);
      return;
    }
    setSending(true);
    setFailed(false);
    try {
      const r = await fetch("/api/project", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lang, data: q, photos: photos.map(({ name, data }) => ({ name, data })) }),
      });
      const j = (await r.json()) as { ok: boolean } & Sent;
      if (!r.ok || !j.ok) throw new Error();
      setSent({ notified: j.notified, confirmed: j.confirmed });
      scrollTop();
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  const artist = artistBySlug(q.artist);

  if (sent) {
    return (
      <div ref={top} className="fade-in max-w-2xl scroll-mt-28" role="status">
        <p className="eyebrow">{f.eyebrow}</p>
        <h2 className="h2 mt-5">{f.done.title}</h2>
        <p className="lead mt-6">{fill(f.done.text, { artist: artist ? artistName(artist) : f.done.artistAny })}</p>
        {sent.confirmed && <p className="mt-4 text-bone/85">{fill(f.done.mail, { email: q.email })}</p>}
        {!sent.notified && (
          <div className="mt-8 border border-gold/50 p-5">
            <p className="text-bone">{f.done.pending}</p>
            <a href={`tel:${site.tel}`} className="btn-solid mt-5">
              <PhoneIcon /> {d.nav.call} · {site.phone}
            </a>
          </div>
        )}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          {artist && (
            <a href={artistInsta(artist)} target="_blank" rel="noopener" className="btn-line">
              <InstagramIcon /> {fill(f.done.seeWork, { handle: `@${artist.handle}` })}
            </a>
          )}
          <button
            type="button"
            className="link-line text-[0.9375rem] text-ash"
            onClick={() => {
              setQ(emptyRequest());
              setPhotos([]);
              setStep(1);
              setSent(null);
            }}
          >
            {f.done.again}
          </button>
        </div>
      </div>
    );
  }

  const err = (k: keyof Errors) => (errors[k] ? <p className="mt-2 text-[0.875rem] text-[#e08a80]">{f.errors[k]}</p> : null);
  const steps = [f.s1, f.s2, f.s3];

  return (
    <div ref={top} className="grid scroll-mt-28 gap-12 lg:grid-cols-[1fr_20rem]">
      <form onSubmit={submit} noValidate className="max-w-3xl">
        <ol className="mb-10 flex gap-2" aria-label={f.title}>
          {steps.map((s, i) => (
            <li key={s} className="flex-1" aria-current={step === i + 1 ? "step" : undefined}>
              <div className={`h-px ${i < step ? "bg-gold" : "bg-line"} transition-colors duration-500`} />
              <p className={`nav-link mt-3 !text-[0.875rem] ${i + 1 === step ? "text-gold" : "text-ash"}`}>
                {String(i + 1).padStart(2, "0")} · {s}
              </p>
            </li>
          ))}
        </ol>

        {step === 1 && (
          <fieldset className="fade-in space-y-8">
            <legend className="sr-only">{f.s1}</legend>
            <div>
              <label htmlFor="artist" className="label">
                {f.artist}
              </label>
              <select id="artist" className="field" value={q.artist} onChange={(e) => set("artist", e.target.value)}>
                <option value="">{f.anyArtist}</option>
                {ARTISTS.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {artistName(a)}
                    {a.name ? ` (@${a.handle})` : ""}
                  </option>
                ))}
              </select>
              {artist && (
                <a href={artistInsta(artist)} target="_blank" rel="noopener" className="mt-3 inline-flex min-h-11 items-center gap-2 text-[0.875rem] text-gold hover:text-gold-hi">
                  <InstagramIcon /> @{artist.handle}
                </a>
              )}
            </div>
            <div role="radiogroup" aria-labelledby="style-l">
              <p id="style-l" className="label">
                {f.style}
              </p>
              <div className="flex flex-wrap gap-2">
                {[{ id: "", name: f.styleUnsure }, ...STYLES.map((s) => ({ id: s.id, name: d.styles.items[s.id as keyof typeof d.styles.items].name }))].map((s) => (
                  <label key={s.id || "none"} className="chip">
                    <input type="radio" name="style" className="sr-only" checked={q.style === s.id} onChange={() => set("style", s.id)} />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>
            <div role="radiogroup" aria-labelledby="kind-l">
              <p id="kind-l" className="label">
                {f.kind}
              </p>
              <div className="flex flex-wrap gap-2">
                {KINDS.map((k) => (
                  <label key={k} className="chip">
                    <input type="radio" name="kind" className="sr-only" checked={q.kind === k} onChange={() => set("kind", k)} />
                    {f.kinds[k]}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="idea" className="label">
                {f.idea} <span className="text-ash">({f.required})</span>
              </label>
              <p id="idea-h" className="mb-3 text-[0.875rem] text-ash">
                {f.ideaHint}
              </p>
              <textarea id="idea" rows={6} className="field" value={q.idea} onChange={(e) => set("idea", e.target.value)} aria-invalid={!!errors.idea} aria-describedby="idea-h" />
              {err("idea")}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="fade-in space-y-8">
            <legend className="sr-only">{f.s2}</legend>
            <div>
              <label htmlFor="zone" className="label">
                {f.zone} <span className="text-ash">({f.required})</span>
              </label>
              <input id="zone" className="field" placeholder={f.zonePlaceholder} value={q.zone} onChange={(e) => set("zone", e.target.value)} aria-invalid={!!errors.zone} />
              {err("zone")}
            </div>
            <div role="radiogroup" aria-labelledby="size-l">
              <p id="size-l" className="label">
                {f.size} <span className="text-ash">({f.required})</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <label key={s} className="chip">
                    <input type="radio" name="size" className="sr-only" checked={q.size === s} onChange={() => set("size", s)} />
                    {f.sizes[s]}
                  </label>
                ))}
              </div>
              {err("size")}
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <div role="radiogroup" aria-labelledby="colour-l">
                <p id="colour-l" className="label">
                  {f.colour}
                </p>
                <div className="flex flex-wrap gap-2">
                  {COLOURS.map((c) => (
                    <label key={c} className="chip">
                      <input type="radio" name="colour" className="sr-only" checked={q.colour === c} onChange={() => set("colour", c)} />
                      {f.colours[c]}
                    </label>
                  ))}
                </div>
              </div>
              <div role="radiogroup" aria-labelledby="first-l">
                <p id="first-l" className="label">
                  {f.first}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["yes", "no"] as const).map((v) => (
                    <label key={v} className="chip">
                      <input type="radio" name="first" className="sr-only" checked={q.first === v} onChange={() => set("first", v)} />
                      {f[v]}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="label">{f.photos}</p>
              <p className="mb-3 text-[0.875rem] text-ash">{f.photosHint}</p>
              <ul className="flex flex-wrap gap-3">
                {photos.map((p, i) => (
                  <li key={p.preview.slice(-40) + i} className="relative size-28 border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL) */}
                    <img src={p.preview} alt="" className="size-full object-cover" />
                    <button type="button" onClick={() => setPhotos((x) => x.filter((_, j) => j !== i))} className="absolute top-1 right-1 grid size-8 place-items-center bg-ink/85 text-bone" aria-label={`${f.remove} ${p.name}`}>
                      <CloseIcon className="size-3.5" />
                    </button>
                  </li>
                ))}
                {photos.length < 3 && (
                  <li>
                    <label className="grid size-28 cursor-pointer place-items-center border border-dashed border-line text-center text-[0.8125rem] text-ash hover:border-gold hover:text-gold">
                      <span className="flex flex-col items-center gap-2 px-2">
                        <PlusIcon /> {f.addPhoto}
                      </span>
                      <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
                    </label>
                  </li>
                )}
              </ul>
              {photoError && <p className="mt-2 text-[0.875rem] text-[#e08a80]">{f.errors.photo}</p>}
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor="budget" className="label">
                  {f.budget}
                </label>
                <select id="budget" className="field" value={q.budget} onChange={(e) => set("budget", e.target.value as ProjectRequest["budget"])}>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>
                      {f.budgets[b]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="availability" className="label">
                  {f.availability}
                </label>
                <input id="availability" className="field" value={q.availability} onChange={(e) => set("availability", e.target.value)} aria-describedby="av-h" />
                <p id="av-h" className="mt-2 text-[0.8125rem] text-ash">
                  {f.availabilityHint}
                </p>
              </div>
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="fade-in space-y-8">
            <legend className="sr-only">{f.s3}</legend>
            <div className="grid gap-8 sm:grid-cols-[1fr_8rem]">
              <div>
                <label htmlFor="name" className="label">
                  {f.name} <span className="text-ash">({f.required})</span>
                </label>
                <input id="name" autoComplete="name" className="field" value={q.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} />
                {err("name")}
              </div>
              <div>
                <label htmlFor="age" className="label">
                  {f.age} <span className="text-ash">({f.required})</span>
                </label>
                <input id="age" type="number" inputMode="numeric" min={10} max={120} className="field" value={q.age} onChange={(e) => set("age", e.target.value)} aria-invalid={!!errors.age} />
                {err("age")}
              </div>
            </div>
            {isMinor(q.age) && (
              <p className="fade-in border-l-2 border-gold bg-ink-2 p-4 text-[0.9375rem] leading-relaxed text-bone/90" role="note">
                {f.minor}
              </p>
            )}
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="label">
                  {f.phone}
                </label>
                <input id="phone" type="tel" autoComplete="tel" className="field" value={q.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.contact} />
              </div>
              <div>
                <label htmlFor="email" className="label">
                  {f.email}
                </label>
                <input id="email" type="email" autoComplete="email" className="field" value={q.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.contact} />
              </div>
            </div>
            {err("contact")}
            <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] leading-relaxed text-bone/85">
              <input type="checkbox" className="mt-1 size-5 shrink-0 accent-[#b8963e]" checked={q.consent} onChange={(e) => set("consent", e.target.checked)} aria-invalid={!!errors.consent} />
              {f.consent}
            </label>
            {err("consent")}
            {!site.payment.deposit && <p className="text-[0.8125rem] text-ash">{f.deposit}</p>}
          </fieldset>
        )}

        {failed && (
          <p className="mt-8 text-[#e08a80]" role="alert">
            {f.errors.send}
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-8">
          {step > 1 && (
            <button
              type="button"
              className="btn-line"
              onClick={() => {
                setStep((s) => (s - 1) as 1 | 2);
                scrollTop();
              }}
            >
              {f.back}
            </button>
          )}
          {step < 3 ? (
            <button type="submit" className="btn-solid">
              {f.next}
            </button>
          ) : (
            <button type="submit" className="btn-solid" disabled={sending} aria-busy={sending}>
              {sending ? f.sending : f.send}
            </button>
          )}
        </div>
      </form>

      <aside className="h-fit border border-line p-6 lg:sticky lg:top-28">
        <p className="nav-link text-ash">{f.callInstead}</p>
        <a href={`tel:${site.tel}`} className="display mt-3 block text-[2rem] hover:text-gold">
          {site.phone}
        </a>
        <a href={`tel:${site.tel}`} className="btn-solid mt-5 w-full">
          <PhoneIcon /> {d.nav.call}
        </a>
        <p className="mt-6 text-[0.875rem] leading-relaxed text-ash">
          {site.address.street}, {site.address.city}
        </p>
        <a href={site.instagram} target="_blank" rel="noopener" className="mt-3 inline-flex min-h-11 items-center gap-2 text-[0.875rem] hover:text-gold">
          <InstagramIcon /> {site.instagramHandle}
        </a>
      </aside>
    </div>
  );
}
