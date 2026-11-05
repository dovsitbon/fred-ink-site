# Fred-Ink Tattoo Studio, site vitrine et demande de projet

Next.js 16 + Tailwind 4 + Framer Motion, français par défaut et anglais (`/fr`, `/en`, hreflang). Aucune base de données.

## Commandes
- `npm run dev` : développement
- `npm run build` : build de production
- `npm run media` : trie `assets/raw/` dans `assets/<catégorie>/` et prépare `public/media/` + `public/og.jpg`
- `npm run logo` : vectorise le logo depuis la photo de profil → `public/logo.svg`, `components/logo-paths.json`
- `npm run affichette` : affichette A5 avec QR code → `public/affichette-fred-ink-a5.pdf`
- `npm run contenu` : régénère `CONTENU.md` (tous les textes, à faire valider)

## Contenu modifiable sans code
- `locales/fr.json`, `locales/en.json` : tous les textes
- `data/horaires.json` : horaires et fermetures (statut Ouvert / Fermé en direct)
- `data/annonces.json` : bandeau (agenda, soirées, guests, flash)
- `data/artistes.json`, `data/projets.json`, `data/styles.json`, `data/piercing.json`
- `data/site.json` : téléphone, WhatsApp (null = désactivé), e-mail, note Google datée, acompte en ligne (désactivé)

## Formulaire de projet
`/api/project` envoie l'e-mail au studio (photos jointes) et la confirmation au client via Resend.
Variables Vercel : `RESEND_API_KEY`, `PROJECT_NOTIFY_EMAIL`, `RESEND_FROM`. Sans elles, le client est invité à appeler.

Infos manquantes : voir `INFOS-A-DEMANDER.md`.
