# Fred-Ink Tattoo Studio : infos à demander

Ce qui manque ou reste à confirmer avant de présenter le site comme définitif. Chaque réponse se reporte dans le fichier indiqué (pas besoin de toucher au code).

## Équipe et artistes → `data/artistes.json`, `data/projets.json`
- [ ] Le prénom de chaque artiste (@fredinktattoo, @silent_screamink, @mappink_, @inkyabe, @p2b.ink, @emy_fredinktattoo). « Fred » et « Emy » sont déduits des pseudos.
- [ ] La bio affiche « 8 tatoueurs, 2 perceurs » : qui sont les deux autres tatoueurs et les deux perceurs ?
- [ ] Les styles de chacun (réalisme, floral, fineline, couleur, chicano, graphique, cover).
- [ ] Un portrait de chaque artiste (au studio, en train de tatouer).
- [ ] Qui a fait chaque pièce du portfolio, et en combien de séances (tableau dans CONTENU.md). Sans ça, ni filtre par artiste ni « 3 pièces » par carte.
- [ ] « Jeje » a gagné un prix à la convention d'Amiens (Facebook) : qui est-ce, quelle année ? À mettre en avant si confirmé.

## Tarifs → `locales/*.json` (FAQ), `data/site.json`
- [ ] Taux horaire ou fourchettes, prix minimum.
- [ ] Acompte : montant, remboursable ou non, délai d'annulation. Paiement en ligne de l'acompte (Stripe) prêt mais désactivé.
- [ ] Moyens de paiement acceptés.

## Piercing → `data/piercing.json`
- [ ] Liste des prestations et prix « à partir de », bijou compris ou non.
- [ ] Matériaux des bijoux (titane, or…), marques.
- [ ] Sans rendez-vous ou sur rendez-vous ?
- [ ] Photos de piercings et de la vitrine à bijoux.

## Mineurs → `locales/*.json` (FAQ, formulaire)
- [ ] Politique du studio : âge minimum tatouage / piercing, projets ou zones refusés, documents demandés. Le site affiche pour l'instant la règle légale (autorisation écrite d'un parent, présent avec sa pièce d'identité).

## Hygiène → `locales/*.json` (section Hygiène)
- [ ] Matériel à usage unique, autoclave ou non, marques d'encres, déclaration ARS, formation hygiène : confirmer ce qui est écrit, ajouter les détails.

## Annonces → `data/annonces.json`
- [ ] Agenda ouvert ou complet en ce moment ?
- [ ] Prochaine soirée au studio, prochains week-ends flash, artistes invités (guests) : dates et textes.

## Contact → `data/site.json`
- [ ] Un portable pour activer WhatsApp (le 03 60 24 54 62 est un fixe).
- [ ] L'e-mail qui reçoit les demandes de projet (pour brancher Resend : RESEND_API_KEY, PROJECT_NOTIFY_EMAIL, RESEND_FROM).
- [ ] Horaires : 10 h ou 10 h 30 en semaine (Mappy indique 10 h 30) ? Fermetures de fin d'année ?
- [ ] Nom de domaine souhaité.

## Visuels → `assets/`
- [ ] Le logo d'origine (vectoriel). Celui du site est redessiné depuis la photo de profil.
- [ ] Photos du studio (intérieur, postes, accueil) : emplacements prévus dans `assets/studio/a-photographier/`.
- [ ] Une courte vidéo muette du studio pour le hero : `assets/hero/video-a-tourner/`.
- [ ] Des avant/après de covers pour la page cover.
- [ ] Accord pour publier la pièce sous la poitrine (photo 02, écartée pour l'instant) et la pièce avec prénoms (photo 38, écartée).

## Mentions légales → `data/site.json` (legal)
- [ ] Raison sociale, SIRET, nom du directeur de la publication.
