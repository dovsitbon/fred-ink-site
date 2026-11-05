import { Resend } from "resend";
import site from "@/data/site.json";
import { artistBySlug, artistInsta, artistName } from "@/lib/data";
import { fill, getDict, isLocale, type Locale } from "@/lib/i18n";
import { isMinor, parseRequest, requestText } from "@/lib/project";

// Demande de projet → e-mails via Resend :
//  1. notification au studio (en français, suivie de la version anglaise si le client a écrit en anglais), photos jointes ;
//  2. confirmation au client, dans sa langue, s'il a donné son e-mail.
// Variables (Vercel → Settings → Environment Variables) :
//   RESEND_API_KEY         clé Resend
//   PROJECT_NOTIFY_EMAIL   adresse du studio qui reçoit les demandes
//   RESEND_FROM            expéditeur sur un domaine vérifié, ex. « Fred-Ink Tattoo <projets@fred-ink.fr> »
// Sans domaine vérifié, Resend n'envoie qu'à l'adresse du compte (la confirmation client est alors ignorée).
// Tant que ces variables manquent, la réponse indique notified: false et le site invite le client à appeler.

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const html = (text: string, extra = "") =>
  `<div style="background:#0E0E0F;padding:32px 24px"><div style="max-width:560px;margin:0 auto;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#EDE8E0;white-space:pre-wrap"><div style="font-size:13px;letter-spacing:.24em;text-transform:uppercase;color:#B8963E;margin-bottom:20px;font-weight:bold">Fred-Ink Tattoo Studio · Amiens</div>${escapeHtml(text).replace(/\*(.+?)\*/g, '<strong style="color:#B8963E">$1</strong>')}${extra}</div></div>`;

const MAX_PHOTO = 1_200_000; // octets décodés par photo

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const lang: Locale = typeof body.lang === "string" && isLocale(body.lang) ? body.lang : "fr";
  const q = parseRequest(body.data);
  if (!q) return Response.json({ ok: false }, { status: 400 });

  const photos = (Array.isArray(body.photos) ? body.photos : [])
    .slice(0, 3)
    .filter((p): p is { name: string; data: string } => !!p && typeof p.name === "string" && typeof p.data === "string" && /^[A-Za-z0-9+/=]+$/.test(p.data))
    .map((p, i) => ({ filename: `reference-${i + 1}.jpg`, content: Buffer.from(p.data, "base64") }))
    .filter((p) => p.content.length > 0 && p.content.length <= MAX_PHOTO);

  const fr = getDict("fr");
  const d = getDict(lang);
  const frText = requestText(q, "fr", fr, photos.length);
  const clientText = requestText(q, lang, d);
  const a = artistBySlug(q.artist);
  const subject = [isMinor(q.age) ? "MINEUR" : null, fr.form.email_.subject, a ? artistName(a) : null, q.name].filter(Boolean).join(" · ");

  const key = process.env.RESEND_API_KEY;
  const to = process.env.PROJECT_NOTIFY_EMAIL ?? site.email ?? undefined;
  if (!key || !to) return Response.json({ ok: true, notified: false, confirmed: false });

  const resend = new Resend(key);
  const from = process.env.RESEND_FROM ?? "Fred-Ink Tattoo Studio <onboarding@resend.dev>";
  const text = lang === "fr" ? frText : `${frText}\n\n— EN —\n\n${clientText}`;
  const call = q.phone ? `\n\n<a href="tel:${escapeHtml(q.phone.replace(/[^\d+]/g, ""))}" style="color:#B8963E">Rappeler ${escapeHtml(q.phone)}</a>` : "";

  let notified = false;
  let confirmed = false;
  try {
    const r = await resend.emails.send({ from, to, replyTo: q.email || undefined, subject, html: html(text, call), text, attachments: photos });
    notified = !r.error;
  } catch {}

  if (q.email) {
    const e = d.form.email_;
    const insta = a ? `\n\n${fill(d.form.done.seeWork, { handle: `@${a.handle}` })} ${artistInsta(a)}` : "";
    const msg = `${fill(e.confirmIntro, { name: q.name })}\n\n${clientText}${insta}\n\n${e.confirmOutro}`;
    try {
      const r = await resend.emails.send({ from, to: q.email, replyTo: to, subject: e.confirmSubject, html: html(msg), text: msg });
      confirmed = !r.error;
    } catch {}
  }
  return Response.json({ ok: true, notified, confirmed });
}
