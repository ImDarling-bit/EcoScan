# Handoff: ECO TAURUS — App mobile de traçabilité de disques durs détruits

## Overview
Maquette fonctionnelle en mode démo (données mockées, aucun backend) du parcours complet de l'app mobile de traçabilité pour ECO TAURUS (recyclage DEEE / rachat de matériel informatique, Gironde). Objectif de cette phase : valider identité visuelle + parcours utilisateur avant l'implémentation React Native réelle.

## About the design files
The files in this bundle are **design references built in HTML** (a self-contained "Design Component" runtime, `support.js`) — they demonstrate intended layout, colors, typography, states and navigation flow. They are **not production code to copy directly**. The task is to **recreate this design in the target React Native codebase** using its existing navigation, state and styling setup — or, if no RN project exists yet, scaffold one (Expo recommended) and implement the screens there using the design tokens below.

Open `Application Tracabilite DEEE.dc.html` directly in a browser (double-click / any static server) to see the live interactive reference — it needs no build step, just `support.js` next to it.

## Fidelity
**High-fidelity.** Colors, typography, spacing and component states below are final for this validation round — recreate pixel-close using React Native's styling (StyleSheet / theme object), not a generic redesign.

## Screens / Views

All screens live inside one phone frame, 390×844 (iPhone-class viewport). Structure: fixed header (56px) + scrollable body + fixed bottom tab bar (72px).

### 1. Entreprises clientes (`companies`, tab root)
- **Purpose**: browse the client companies ECO TAURUS collects from.
- **Layout**: header shows the ECO TAURUS logo (28×28) + title "Entreprises clientes". Body: a "N entreprises suivies" caption (13px, `#5B6672`), then a vertical list of company cards, `gap`/`margin-bottom: 10px`.
- **Company card**: full-width button, white surface, `border: 1px solid #D8E1EA`, `border-radius: 12px`, `padding: 14px`. Top row: company name (Manrope 700, 15px, `#1B2430`) left, a pill badge right showing disk count (12px/600, text `#5C9427` on `#EAF5DC`, `border-radius: 999px`, `padding: 3px 9px`). Below: city + SIRET (12px, `#5B6672`), then "Dernier passage : <date>" (12px, `#5B6672`).
- Tapping a card opens screen 2 for that company.

### 2. Fiche entreprise (`company`)
- **Purpose**: company details + its disk inventory; entry point to scan a new disk.
- **Layout**: header has a back arrow + company name as title. Body: an info card (white, bordered, 12px radius, 14px padding) with address and "SIRET … · Contact : …" (both 12px, `#5B6672`).
- **CTA "Scanner un disque"**: full-width button, `background:#2E75B6`, white text, Manrope 700/15px, `border-radius:10px`, `padding:13px`, camera icon (18px, white stroke) + label, `margin-bottom:18px`.
- **Disk list header**: "Disques associés (N)" — Manrope 700/14px.
- **Disk card**: white, bordered, 12px radius, 12px padding, `margin-bottom:8px`. Left: brand — type (Manrope 700/14px) + "S/N … · size" (12px, `#5B6672`). Right: status pill (11px/600): green `#5C9427`/`#EAF5DC` for "Détruit", amber `#A6621F`/`#F6E7D2` for "En attente". Bottom: date (11px, `#7A8694`).

### 3. Choisir une entreprise (`scanPick`)
- Shown when the user taps the central Scan tab without an active company context.
- **Layout**: caption "Choisissez l'entreprise concernée par ce disque." (13px, `#5B6672`), then the same company list pattern as screen 1 but each row is a plain text button (Manrope 700/14px, `#1B2430`) — no badge/meta, single tap selects and proceeds to Scan.

### 4. Scanner un disque (`scan`)
- **Purpose**: simulate reading a disk's label via camera.
- **Layout**: caption "Entreprise : **<name>**" (13px, name bold `#1B2430`).
- **Scan frame**: 260px tall, `border:2px dashed #B9C7D4`, `border-radius:16px`, white background, centered content.
  - Idle state: a rectangle/grid icon (46px, `#7A8694`, stroke 1.3) + "Cadrez l'étiquette du disque dans le repère (simulation)" (13px, `#5B6672`, centered, max-width 220px).
  - Scanning state (1.2s): a spinning circle icon (46px, `#2E75B6`, `animation: spin 1.1s linear infinite`) + "Lecture de l'étiquette en cours…" (13px, `#5B6672`).
- **Primary button "Lancer le scan"**: `background:#2E75B6`, white text, full width, 14px padding, radius 10px; label switches to "Scan en cours…" and opacity 0.6 while scanning; disabled during scan.
- **Secondary link "Saisir manuellement sans scan"**: text button, `#5B6672`, underlined, 13px — skips straight to the empty form.
- On scan completion: five mock presets are picked at random (S/N, brand, type, size) and the form (screen 5) opens pre-filled.

### 5. Confirmer les informations (`form`)
- **Purpose**: review/edit the scanned (or manual) disk data before logging its destruction.
- **Layout**: caption "Vérifiez les informations avant de confirmer la destruction — **<company>**" (13px).
- **Text fields** (S/N, Marque, Taille): label above (12px/600, `#5B6672`, `margin-bottom:6px`), input full width, `border:1px solid #D8E1EA`, `border-radius:10px`, `padding:11px 12px`, 14px text, white background.
- **Type selector**: 3 segmented buttons (HDD / SSD / NVMe) in a row, `gap:6px`, each `flex:1`, `border-radius:10px`, `padding:10px 4px`, 13px/600. Inactive: white bg, `#5B6672` text, `#D8E1EA` border. Active: `#DCE9F5` bg, `#1F5586` text/border.
- **Primary button "Confirmer la destruction"**: same style as the scan primary button (`#2E75B6` bg, white text, full width, radius 10px, 14px padding).

### 6. Destruction confirmée (`success`)
- **Purpose**: confirm the disk was logged.
- **Layout**: centered column, 40px vertical / 12px horizontal padding. A 64px circle, `background:#EAF5DC`, containing a checkmark icon (30px, `#5C9427`, stroke 2). Title "Destruction enregistrée" (Manrope 800/18px, `#1B2430`). Body: "Le disque <S/N> a été ajouté à l'historique de traçabilité de <company>." (13px, `#5B6672`, max-width 260px, line-height 1.5). Button "Retour à l'entreprise" (`#2E75B6` bg, white text, radius 10px, padding `12px 22px`, `margin-top:24px`) returns to screen 2.

### 7. Historique (`history`, tab root)
- **Purpose**: browse every destroyed disk across all companies, filterable.
- **Filter row**: 2-column grid, `gap:8px`. Four controls: company `<select>`, type `<select>` (HDD/SSD/NVMe), brand `<select>` (populated from distinct brands present in history), date `<input type="date">`. All `border:1px solid #D8E1EA`, `border-radius:10px`, 13px text.
- **"Réinitialiser les filtres"** link (only shown when a filter is active): text button, `#2E75B6`, underlined, 12px.
- **Result count caption**: "N résultat(s)" (12px, `#5B6672`).
- **History card**: same visual pattern as the disk card in screen 2, but the right-side pill always shows the destruction date in green (`#5C9427`/`#EAF5DC`) instead of a status word (every entry here is already "Détruit"), and a company name line is added under the S/N line.
- **Empty state**: "Aucun résultat pour ces filtres." centered, `#7A8694`, 13px, `padding:32px 0`.

## Header & Tab bar (persist across all screens)
- **Header** (56px, white, `border-bottom:1px solid #D8E1EA`): back arrow (20px, `#1B2430`, only on non-root screens) + on root screens (`companies`, `history`) the ECO TAURUS logo (28×28 PNG) + screen title (Manrope 800/17px, `#1B2430`, truncates with ellipsis).
- **Tab bar** (72px, white, `border-top:1px solid #D8E1EA`, `justify-content:space-around`): "Entreprises" (building icon + label, active color `#2E75B6`, inactive `#7A8694`) — "Historique" (clock icon + label, same active/inactive rule) — a **central floating Scan button** between them: 52×52 circle, `background:#5C9427`, `margin-top:-24px` (overlaps the bar), `box-shadow:0 6px 14px rgba(92,148,39,0.35)`, white camera icon (22px).

## Interactions & Behavior
- Navigation is a simple internal state machine (`screen` + `selectedCompanyId`), no deep linking needed for v1.
- Back button: `company`→`companies`, `scanPick`→`companies`, `scan`→(`scanPick` or `company`, depending on entry point), `form`→`scan`.
- Tab "Entreprises" always resets to the companies list (clears selected company). Tab "Historique" always shows the full/filtered history. Tapping the central Scan button: if a company is already open (`screen === 'company'`), jumps straight to Scan for that company; otherwise opens the company picker first.
- Scan simulation: `setTimeout` ~1200ms, then picks one of 5 hardcoded presets at random and pre-fills the form.
- Confirming destruction: prepends a new disk record (status `Détruit`, today's date) to that company's disk list — it appears both on the company's disk list and in Historique immediately.
- Form fields are plain controlled inputs (no validation implemented in the demo — add required-field / S/N-format validation in the real app).
- History filters are pure client-side array filters (company exact match, type exact match, brand exact match, date exact match) — replace with a real query once there's a backend.
- No animations beyond: the scan spinner rotation and standard button `:active`/tap feedback (not implemented in the HTML demo — add native touch feedback in RN, e.g. `Pressable` opacity/scale).

## State management
Suggested RN state shape (mirrors the demo's internal state):
```
screen: 'companies' | 'company' | 'scanPick' | 'scan' | 'form' | 'success' | 'history'
selectedCompanyId: string | null
scanning: boolean
form: { sn, brand, type: 'HDD'|'SSD'|'NVMe', size }
historyFilters: { company, type, brand, date }
```
Data requirements for the real app: a companies list (id, name, address, siret, contact, lastVisit) and a disks collection keyed by company (id, sn, brand, type, size, status, date) — replace the hardcoded arrays in the DC's logic class (`companiesData`, `disksData`) with real API calls / local DB queries.

## Design tokens
See `design-tokens.json` in this folder — colors, typography, spacing, radius, shadows, all as literal values matching what's used inline in the HTML (so 1:1 portable to a React Native `theme.ts` / `StyleSheet.create`).

Key roles:
- **Primary (blue, brand/chrome/CTAs)**: `#2E75B6` / dark `#1F5586` / light `#DCE9F5`
- **Accent (green, scan action + eco/success status)**: `#8DC63F` base / dark `#5C9427` / light `#EAF5DC`
- **Warning (amber, "En attente" status)**: `#C97A2E` / light `#F6E7D2`, text `#A6621F`
- **Danger**: `#B3432F` / light `#F5DED8`
- **Neutrals**: background `#F4F7FA`, surface `#FFFFFF`, border `#D8E1EA`, text primary `#1B2430`, text secondary `#5B6672`
- **Type**: headings Manrope 700/800, body Public Sans 400/500/600
- **Radius**: cards/inputs 10–12px, pill badges 999px
- Both brand colors come directly from the ECO TAURUS logo (blue globe, green continents) — blue is dominant/primary, green is the accent used specifically for the scan action and "done/eco" status.

## Assets
- `assets/logo-eco-taurus.png` — the client's real logo (provided by the user), used in the app header and on the moodboard. No other imagery is used (the demo intentionally avoids stock/placeholder photography).

## Files in this bundle
- `Application Tracabilite DEEE.dc.html` — the interactive design reference (open directly in a browser, needs `support.js` alongside it).
- `Moodboard.dc.html` — the visual identity reference (palette, type, tone, iconography, inspiration notes).
- `support.js` — runtime the two files above depend on to render (do not port this file — it's a design-tool artifact, not app code).
- `design-tokens.json` — portable design tokens.
- `assets/logo-eco-taurus.png` — brand logo.
