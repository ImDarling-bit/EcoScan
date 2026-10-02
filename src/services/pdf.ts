import { Buffer } from 'buffer';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { LOGO_ECO_TAURUS_PNG_BASE64 } from '../assets/logoBase64';
import { formaterLibelleSession } from '../db/sessions';
import { extraireChampsEtiquette } from './ocr';
import type { Disque, Entreprise, Session } from '../types';

// Coordonnées ECO TAURUS reprises du site public
// (https://recyclage-achat-informatique.com/, page contact + politique de
// confidentialité) — à mettre à jour ici si elles changent.
const SOCIETE = {
  nom: 'ECO TAURUS',
  adresse: '30 D allée des chênes, 33370 Pompignac',
  siret: '833 464 647 00019',
  telephone: '06 61 92 62 88',
} as const;

const COULEUR_PRIMAIRE = rgb(0.1804, 0.4588, 0.7137); // couleurs.primary
const COULEUR_TEXTE_PRIMAIRE = rgb(0.1059, 0.1412, 0.1882); // couleurs.textPrimary
const COULEUR_TEXTE_SECONDAIRE = rgb(0.3569, 0.4, 0.4471); // couleurs.textSecondary
const COULEUR_BORDURE = rgb(0.8471, 0.8824, 0.9176); // couleurs.border

// pdf-lib s'appuie sur `Buffer`, absent de l'environnement Hermes par défaut.
const globalAvecBuffer = globalThis as typeof globalThis & { Buffer?: unknown };
if (typeof globalAvecBuffer.Buffer === 'undefined') {
  globalAvecBuffer.Buffer = Buffer;
}

export interface SessionAvecDisques {
  session: Session;
  disques: Disque[];
}

const PAGE_WIDTH = 595.28; // A4 portrait, en points
const PAGE_HEIGHT = 841.89;
const MARGE = 40;
const COLONNES = [
  { titre: 'S/N', x: 0, largeur: 150 },
  { titre: 'Marque', x: 150, largeur: 90 },
  { titre: 'Capacité', x: 240, largeur: 70 },
  { titre: 'Type', x: 310, largeur: 50 },
  { titre: 'Date', x: 360, largeur: 130 },
];

interface Contexte {
  doc: PDFDocument;
  police: PDFFont;
  policeGrasse: PDFFont;
  page: PDFPage;
  y: number;
}

function nouvellePage(doc: PDFDocument): PDFPage {
  return doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
}

/**
 * Papier à en-tête ECO TAURUS (logo + coordonnées) dessiné en haut de la
 * première page du rapport. Retourne le y à partir duquel le contenu peut
 * commencer, sous le filet séparateur.
 */
async function dessinerPapierEnTete(doc: PDFDocument, page: PDFPage, police: PDFFont, policeGrasse: PDFFont): Promise<number> {
  const logo = await doc.embedPng(LOGO_ECO_TAURUS_PNG_BASE64);
  const tailleLogo = 42;
  const yHautBloc = PAGE_HEIGHT - MARGE;
  const yLogo = yHautBloc - tailleLogo + 8;

  page.drawImage(logo, { x: MARGE, y: yLogo, width: tailleLogo, height: tailleLogo });

  const xTexte = MARGE + tailleLogo + 12;
  page.drawText(SOCIETE.nom, {
    x: xTexte,
    y: yHautBloc - 11,
    size: 15,
    font: policeGrasse,
    color: COULEUR_TEXTE_PRIMAIRE,
  });
  page.drawText(SOCIETE.adresse, {
    x: xTexte,
    y: yHautBloc - 26,
    size: 8.5,
    font: police,
    color: COULEUR_TEXTE_SECONDAIRE,
  });
  page.drawText(`SIRET ${SOCIETE.siret} · Tél. ${SOCIETE.telephone}`, {
    x: xTexte,
    y: yHautBloc - 38,
    size: 8.5,
    font: police,
    color: COULEUR_TEXTE_SECONDAIRE,
  });

  const yFilet = yLogo - 12;
  page.drawLine({
    start: { x: MARGE, y: yFilet },
    end: { x: PAGE_WIDTH - MARGE, y: yFilet },
    thickness: 1.2,
    color: COULEUR_BORDURE,
  });

  return yFilet - 24;
}

function assurerPlace(ctx: Contexte, hauteurNecessaire: number): Contexte {
  if (ctx.y - hauteurNecessaire < MARGE) {
    const page = nouvellePage(ctx.doc);
    return { ...ctx, page, y: PAGE_HEIGHT - MARGE };
  }
  return ctx;
}

function dessinerEnTeteColonnes(ctx: Contexte): Contexte {
  ctx = assurerPlace(ctx, 20);
  COLONNES.forEach((colonne) => {
    ctx.page.drawText(colonne.titre, {
      x: MARGE + colonne.x,
      y: ctx.y,
      size: 9,
      font: ctx.policeGrasse,
      color: rgb(0.4, 0.44, 0.52),
    });
  });
  return { ...ctx, y: ctx.y - 14 };
}

function dessinerLigneDisque(ctx: Contexte, disque: Disque): Contexte {
  ctx = assurerPlace(ctx, 16);
  const valeurs = [
    disque.serialNumber,
    disque.brand,
    disque.capacity,
    disque.type,
    new Date(disque.createdAt).toLocaleDateString('fr-FR'),
  ];
  valeurs.forEach((valeur, index) => {
    const colonne = COLONNES[index];
    if (!colonne) {
      return;
    }
    ctx.page.drawText(valeur, {
      x: MARGE + colonne.x,
      y: ctx.y,
      size: 9,
      font: ctx.police,
      color: rgb(0.1, 0.1, 0.15),
      maxWidth: colonne.largeur - 4,
    });
  });
  return { ...ctx, y: ctx.y - 16 };
}

function dessinerEnTeteSession(ctx: Contexte, session: Session, nbDisques: number): Contexte {
  ctx = assurerPlace(ctx, 30);
  ctx.page.drawText(`${formaterLibelleSession(session)}  (${nbDisques} disque${nbDisques > 1 ? 's' : ''})`, {
    x: MARGE,
    y: ctx.y,
    size: 12,
    font: ctx.policeGrasse,
    color: rgb(0.09, 0.36, 0.83),
  });
  return { ...ctx, y: ctx.y - 20 };
}

/** Découpe un texte en lignes qui tiennent dans `largeurMax` à la taille de police donnée. */
function decouperTexte(texte: string, police: PDFFont, taille: number, largeurMax: number): string[] {
  const mots = texte.split(/\s+/).filter(Boolean);
  const lignes: string[] = [];
  let ligneActuelle = '';

  for (const mot of mots) {
    const essai = ligneActuelle ? `${ligneActuelle} ${mot}` : mot;
    if (ligneActuelle && police.widthOfTextAtSize(essai, taille) > largeurMax) {
      lignes.push(ligneActuelle);
      ligneActuelle = mot;
    } else {
      ligneActuelle = essai;
    }
  }
  if (ligneActuelle) {
    lignes.push(ligneActuelle);
  }
  return lignes;
}

/**
 * Page d'annexe dédiée à un disque : identifiants, puis les champs de
 * l'étiquette (Modèle, S/N, P/N, Firmware, WWN, PSID...) dans un ORDRE
 * TOUJOURS IDENTIQUE (voir `extraireChampsEtiquette`, la même fonction que
 * la page d'édition — affichage cohérent entre les deux), et enfin le texte
 * brut complet lu par l'OCR ("le reste des infos scannées", conservé sans
 * parsing pour archive même si un champ n'a pas été reconnu).
 */
function dessinerAnnexeDisque(ctx: Contexte, disque: Disque): Contexte {
  ctx = { ...ctx, page: nouvellePage(ctx.doc), y: PAGE_HEIGHT - MARGE };
  const largeurDisponible = PAGE_WIDTH - MARGE * 2;

  ctx.page.drawText(`Annexe — S/N ${disque.serialNumber}`, {
    x: MARGE,
    y: ctx.y,
    size: 14,
    font: ctx.policeGrasse,
    color: rgb(0.06, 0.09, 0.16),
  });
  ctx = { ...ctx, y: ctx.y - 20 };

  ctx.page.drawText(
    `${disque.brand} · ${disque.capacity} · ${disque.type} · ${new Date(disque.createdAt).toLocaleString('fr-FR')}`,
    { x: MARGE, y: ctx.y, size: 10, font: ctx.police, color: rgb(0.4, 0.44, 0.52) },
  );
  ctx = { ...ctx, y: ctx.y - 24 };

  const texte = disque.rawText?.trim();
  if (!texte) {
    ctx.page.drawText('Aucun texte scanné pour ce disque (saisie manuelle).', {
      x: MARGE,
      y: ctx.y,
      size: 10,
      font: ctx.police,
      color: rgb(0.4, 0.44, 0.52),
    });
    return { ...ctx, y: ctx.y - 16 };
  }

  const champs = extraireChampsEtiquette(texte);
  if (champs.length > 0) {
    ctx.page.drawText('Informations lues sur l\'étiquette', {
      x: MARGE,
      y: ctx.y,
      size: 11,
      font: ctx.policeGrasse,
      color: rgb(0.06, 0.09, 0.16),
    });
    ctx = { ...ctx, y: ctx.y - 18 };

    for (const champ of champs) {
      ctx = assurerPlace(ctx, 16);
      ctx.page.drawText(`${champ.label} :`, {
        x: MARGE,
        y: ctx.y,
        size: 10,
        font: ctx.policeGrasse,
        color: rgb(0.4, 0.44, 0.52),
      });
      ctx.page.drawText(champ.valeur, {
        x: MARGE + 110,
        y: ctx.y,
        size: 10,
        font: ctx.police,
        color: rgb(0.1, 0.1, 0.15),
        maxWidth: largeurDisponible - 110,
      });
      ctx = { ...ctx, y: ctx.y - 16 };
    }
    ctx = { ...ctx, y: ctx.y - 10 };
  }

  ctx = assurerPlace(ctx, 30);
  ctx.page.drawText('Texte brut complet', {
    x: MARGE,
    y: ctx.y,
    size: 11,
    font: ctx.policeGrasse,
    color: rgb(0.06, 0.09, 0.16),
  });
  ctx = { ...ctx, y: ctx.y - 18 };

  for (const ligne of decouperTexte(texte, ctx.police, 10, largeurDisponible)) {
    ctx = assurerPlace(ctx, 14);
    ctx.page.drawText(ligne, {
      x: MARGE,
      y: ctx.y,
      size: 10,
      font: ctx.police,
      color: rgb(0.1, 0.1, 0.15),
    });
    ctx = { ...ctx, y: ctx.y - 14 };
  }

  return ctx;
}

export interface OptionsRapport {
  /**
   * Ajoute, après le tableau récapitulatif, une page d'annexe par disque
   * avec le texte brut lu par l'OCR au moment du scan (P/N, WWN, PSID...).
   * Option à cocher explicitement (voir `PdfSessionSelectionScreen`) : le
   * rapport reste compact par défaut.
   */
  inclureAnnexes?: boolean;
}

/**
 * Génère un PDF listant, pour une entreprise, l'ensemble des disques des
 * sessions sélectionnées (regroupés par session, rien n'est omis : chaque
 * disque enregistré dans l'app pour ces sessions apparaît dans le rapport).
 * Retourne le chemin du fichier local généré.
 */
export async function genererRapportSessions(
  entreprise: Entreprise,
  sessionsAvecDisques: SessionAvecDisques[],
  options: OptionsRapport = {},
): Promise<string> {
  const doc = await PDFDocument.create();
  const police = await doc.embedFont(StandardFonts.Helvetica);
  const policeGrasse = await doc.embedFont(StandardFonts.HelveticaBold);

  const premierePage = nouvellePage(doc);
  const yApresEntete = await dessinerPapierEnTete(doc, premierePage, police, policeGrasse);
  let ctx: Contexte = { doc, police, policeGrasse, page: premierePage, y: yApresEntete };

  ctx.page.drawText(`Certificat de destruction — ${entreprise.nom}`, {
    x: MARGE,
    y: ctx.y,
    size: 16,
    font: policeGrasse,
    color: COULEUR_PRIMAIRE,
  });
  ctx = { ...ctx, y: ctx.y - 22 };

  ctx.page.drawText(`Généré le ${new Date().toLocaleString('fr-FR')}`, {
    x: MARGE,
    y: ctx.y,
    size: 10,
    font: police,
    color: COULEUR_TEXTE_SECONDAIRE,
  });
  ctx = { ...ctx, y: ctx.y - 26 };

  let totalDisques = 0;
  for (const { session, disques } of sessionsAvecDisques) {
    ctx = dessinerEnTeteSession(ctx, session, disques.length);
    ctx = dessinerEnTeteColonnes(ctx);
    for (const disque of disques) {
      ctx = dessinerLigneDisque(ctx, disque);
      totalDisques += 1;
    }
    ctx = { ...ctx, y: ctx.y - 14 };
  }

  ctx = assurerPlace(ctx, 20);
  ctx.page.drawText(`Total : ${totalDisques} disque${totalDisques > 1 ? 's' : ''} sur ${sessionsAvecDisques.length} session${sessionsAvecDisques.length > 1 ? 's' : ''}`, {
    x: MARGE,
    y: ctx.y,
    size: 10,
    font: policeGrasse,
    color: rgb(0.06, 0.09, 0.16),
  });

  if (options.inclureAnnexes) {
    for (const { disques } of sessionsAvecDisques) {
      for (const disque of disques) {
        ctx = dessinerAnnexeDisque(ctx, disque);
      }
    }
  }

  const base64 = await doc.saveAsBase64();
  const nomFichier = `rapport-${entreprise.nom.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${Date.now()}.pdf`;
  const chemin = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${nomFichier}`;
  await ReactNativeBlobUtil.fs.writeFile(chemin, base64, 'base64');

  return chemin;
}
