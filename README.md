# EcoScan (ECO TAURUS)

Application mobile (React Native CLI, Android en priorité) de traçabilité des
disques durs (HDD/SSD/NVMe) détruits pour le compte de clients, aux couleurs
du client **ECO TAURUS** (voir `design_handoff_hdd_traceability/`).

## Stack

- React Native 0.87 (CLI, TypeScript strict)
- React Navigation : barre d'onglets (`@react-navigation/bottom-tabs`) —
  Entreprises / Scan (bouton central) / Historique — chaque onglet gérant sa
  propre pile (`native-stack`)
- SQLite local (`@op-engineering/op-sqlite`, JSI, compatible New Architecture)
- `react-native-vision-camera` v5 (Nitro) + `react-native-vision-camera-mlkit`
  (ML Kit : code-barres/QR + OCR sur photo, scan déclenché manuellement,
  voir `src/services/scan.ts`)
- `pdf-lib` + `react-native-pdf` + `react-native-share` pour l'export PDF
- `react-native-svg` pour les icônes (barre d'onglets, CTA scan)
- Zustand pour le state management

## Identité visuelle ECO TAURUS

`src/theme.ts` centralise les tokens du handoff design
(`design_handoff_hdd_traceability/design-tokens.json`) : couleurs (bleu
`#2E75B6` primaire, vert `#8DC63F`/`#5C9427` accent scan/succès), typographie
(Manrope 700/800 pour les titres, Public Sans 400/500/600 pour le corps),
espacements et rayons. Tout style en dur dans un écran doit venir de ce
fichier plutôt que d'être réinventé.

Les polices sont embarquées en statique dans
`android/app/src/main/assets/fonts/` (Manrope-Bold, Manrope-ExtraBold,
PublicSans-Regular/Medium/SemiBold) — sur Android, le nom de fichier (sans
extension) sert directement de `fontFamily`. Le logo est dans
`src/assets/logo-eco-taurus.png`, affiché dans `AppHeader`
(`src/components/AppHeader.tsx`) sur les écrans racines de chaque onglet.

**Non fait volontairement** (hors du périmètre choisi pour cette passe) : les
nouveaux champs visibles dans la maquette (adresse/SIRET/contact/dernier
passage sur l'entreprise, statut "Détruit"/"En attente" par disque) —
purement visuels + navigation par onglets cette fois, pas de nouvelles
données. La hiérarchie d'information déjà validée sur la fiche disque (S/N
mis en avant) a été conservée plutôt que remplacée par celle de la maquette.

## Structure

```
src/
  components/   composants UI réutilisables (dont icons/ et AppHeader)
  db/           ouverture SQLite, migrations, requêtes (entreprises, disques)
  navigation/   tab navigator + stacks + types de routes
  screens/      les écrans de l'application
  services/     scan.ts (capture photo HD + analyse code-barres/OCR),
                ocr.ts (extraction marque/capacité/S/N), pdf.ts (export PDF),
                permissions.ts (permission caméra Android)
  store/        stores Zustand (entreprises, disques)
  theme.ts      tokens de design ECO TAURUS (couleurs, polices, espacements)
  types/        modèles de données partagés
```

## Modèle de données

Les tables `entreprises` et `disques` portent chacune une colonne
`synced_at` et un flag `dirty` (voir `src/db/schema.ts`). Elles ne sont pas
exploitées dans cette itération : la synchronisation avec le desktop est
prévue pour une itération suivante, ces colonnes préparent uniquement le
terrain.

## Installation

```bash
npm install
```

### Android

Aucune permission à configurer manuellement en plus de ce qui est déjà dans
`android/app/src/main/AndroidManifest.xml` (`CAMERA` + features caméra). La
permission est aussi demandée à l'exécution (Android 6+) via
`src/services/permissions.ts`, qui s'appuie sur l'API de
`react-native-vision-camera`.

```bash
npm run android
```

### ML Kit sélectif (taille d'APK)

`android/build.gradle` (racine) configure `react-native-vision-camera-mlkit`
pour ne compiler que le scan de codes-barres/QR et l'OCR latin (voir le bloc
`ext["react-native-vision-camera-mlkit"]`), sans les langues non latines.

### Scan manuel déclenché par bouton (pas de détection en continu)

Analyse de 10 étiquettes réelles (Seagate, WD, Hitachi, Dell/OEM, Crucial,
Kingston, Intel...) : la marque et la capacité ne sont **jamais** encodées
en code-barres (toujours du texte imprimé), et une étiquette de HDD porte
souvent 3 à 5 codes-barres différents (modèle, S/N, P/N, firmware, WWN) —
sans texte pour trancher, impossible de savoir lequel est le vrai S/N.

Une première version détectait les codes-barres en continu sur un flux basse
résolution puis déclenchait une capture HD différée : le disque pouvait
légèrement bouger entre la détection et la capture, ce qui pouvait faire
lire le mauvais code ou rater l'étiquette. Le scan est donc **entièrement
manuel** : l'utilisateur cadre le disque, appuie sur le bouton "Scanner",
et tout part d'une seule photo prise à cet instant précis (`ScanScreen` +
`src/services/scan.ts`) :

1. `usePhotoHauteResolution` capture **une photo plein capteur** (pas une
   frame de prévisualisation basse résolution), qualité maximale, flash
   automatique — le principal correctif pour les confusions de caractères
   (O/0, B/8, Z/2...) et la qualité limitée du capteur du OnePlus 6T.
2. `analyserPhotoDisque` lit codes-barres et texte sur **cette même photo**,
   au même instant — plus de décalage possible entre les deux lectures.
3. `choisirNumeroSerie` (`src/services/ocr.ts`) fait une **double
   vérification**, jamais un choix à l'aveugle : elle cherche le texte
   labellisé "S/N"/"HDD S/N"/"Serial No"/"ISN", puis calcule un score de
   correspondance (distance de Levenshtein, tolérant O/0, B/8, Z/2, I/L/1,
   S/5) contre CHAQUE code-barres détecté. Le code-barres retenu doit
   atteindre au moins **80% de correspondance** avec le texte — sinon
   (ex : un code-barres de P/N, WWN ou PSID détecté à la place de celui du
   S/N), `fiable: false` est renvoyé et `ScanScreen` affiche un avertissement
   ⚠️ demandant de vérifier l'information avant de continuer, plutôt que de
   deviner un code-barres au hasard.
4. Résultat affiché pour vérification (S/N, marque, capacité) avant de
   valider et passer au disque suivant, ou de rescanner.

Amélioration possible si ça reste insuffisant : un prétraitement d'image
(contraste, netteté) avant l'analyse ML Kit, via une librairie de
manipulation d'image dédiée — pas encore fait, à évaluer si la photo plein
capteur ne suffit pas.

## Écrans

**Onglet Entreprises** (pile `EntreprisesStack`) :
1. **Entreprises** (`EntrepriseListScreen`) — recherche + création rapide.
2. **Fiche entreprise** (`EntrepriseDetailScreen`) — CTA "Scanner un disque"
   (popup de sélection du type HDD/SSD/NVMe **avant** le scan — le type ne
   vient jamais du scan), liste des disques par session, lien "Saisir
   manuellement sans scan".
3. **Scan** (`ScanScreen`) — caméra plein écran (cadre portrait), bouton
   "Scanner" qui capture une photo HD et l'analyse (S/N, marque, capacité),
   puis formulaire de confirmation pré-rempli et éditable.
4. **Saisie manuelle** (`ManualEntryScreen`) — fallback si le scan échoue ;
   le type est pré-rempli avec celui choisi avant le scan, mais reste
   corrigeable.
5. **Export PDF** (`PdfSessionSelectionScreen` + `PdfPreviewScreen`) —
   sélection des sessions à inclure, option "Annexe détaillée par disque"
   (une page par disque avec le texte OCR brut complet — P/N, WWN, PSID...
   jamais parsé individuellement mais conservé pour archive), génération et
   partage du rapport.

**Bouton Scan central de la barre d'onglets** : ouvre
`ScanChoisirEntrepriseScreen` (choix de l'entreprise, puis popup de type)
quand on n'a pas encore de fiche entreprise ouverte.

**Onglet Historique** (pile `HistoriqueStack`, un seul écran) :
6. **Historique** (`HistoryScreen`) — filtres par entreprise, type, marque
   et date, compteur de résultats, "Réinitialiser les filtres".

## Prochaine itération

- Synchronisation avec le desktop (colonnes `synced_at` / `dirty` déjà en
  place).
- `@op-engineering/op-sqlite` expose des requêtes réactives
  (`reactiveExecute`) qui pourront simplifier la synchro offline-first le
  moment venu.
