const MARQUES_CONNUES = [
  'Seagate',
  'Western Digital',
  'WD',
  'Toshiba',
  'Samsung',
  'Kingston',
  'Crucial',
  'SanDisk',
  'Hitachi',
  'HGST',
  'Intel',
  'Micron',
  'ADATA',
  'Corsair',
  'Dell',
  'Lite-On',
  'LiteOn',
];

const REGEX_CAPACITE = /(\d+(?:[.,]\d+)?)\s?(To|TB|Go|GB)\b/i;

// Sur les disques (HDD comme SSD), le seul champ qui identifie le composant
// de façon unique est celui explicitement libellé "S/N" — les fabricants
// utilisent aussi "SN", "HDD S/N", "Serial No/Number" ou, pour Intel, "ISN"
// (Intel Serial Number). Un code-barres pris au hasard sur l'étiquette peut
// encoder autre chose (P/N, modèle, firmware, WWN, PSID...), donc ce texte
// labellisé prime toujours — jamais un code-barres choisi à l'aveugle.
const REGEX_NUMERO_SERIE =
  /\b(?:HDD\s*)?(?:S\s*\/?\s*N|SERIAL\s*(?:NO\.?|NUMBER)|ISN)\.?\s*[:#]?\s*([A-Z0-9-]{4,})/i;

/** Seuil de correspondance (0-1) entre le S/N lu par l'OCR et un code-barres
 * pour considérer que ce code-barres est bien le S/N. */
const SEUIL_CORRESPONDANCE = 0.8;

// Champs classiques d'une étiquette de disque, dans un ordre de lecture
// toujours identique — indépendant de l'ordre réel (souvent désordonné) dans
// lequel l'OCR restitue le texte. Chaque champ est cherché indépendamment
// dans le texte complet, donc l'ordre de cette liste = l'ordre d'affichage.
const CHAMPS_ETIQUETTE: ReadonlyArray<{ label: string; regex: RegExp }> = [
  { label: 'Modèle', regex: /\b(?:MDL|MODEL|MODÈLE)\.?\s*[:#]?\s*([A-Z0-9-]{4,})/i },
  { label: 'S/N', regex: REGEX_NUMERO_SERIE },
  { label: 'DP/N', regex: /\bDP\s*\/?\s*N\.?\s*[:#]?\s*([A-Z0-9-]{4,})/i },
  { label: 'P/N', regex: /\bP\s*\/?\s*N\.?\s*[:#]?\s*([A-Z0-9-]{4,})/i },
  { label: 'Firmware', regex: /\b(?:F\s*\/?\s*W|FIRMWARE)\.?\s*[:#]?\s*([A-Z0-9.]{2,})/i },
  { label: 'WWN', regex: /\bWWN\.?\s*(?:NO\.?)?\s*[:#]?\s*([A-Z0-9]{8,})/i },
  { label: 'PSID', regex: /\bPSID\.?\s*[:#]?\s*([A-Z0-9-]{8,})/i },
  { label: 'Référence', regex: /\bR\s*\/?\s*N\.?\s*[:#]?\s*([A-Z0-9-]{4,})/i },
  { label: 'Date de fabrication', regex: /\b(?:DOM|DATE\s*CODE)\.?\s*[:#]?\s*([0-9A-Z/-]{4,})/i },
];

export interface InfosExtraites {
  marque: string | null;
  capacite: string | null;
}

/**
 * Extrait, de façon best-effort, la marque et la capacité à partir du texte
 * brut lu par l'OCR sur l'étiquette du disque. Le résultat reste toujours
 * éditable par l'utilisateur dans le formulaire de confirmation : cette
 * fonction ne fait que pré-remplir.
 */
export function extraireInfosEtiquette(rawText: string): InfosExtraites {
  const marqueTrouvee = MARQUES_CONNUES.find((marque) =>
    rawText.toLowerCase().includes(marque.toLowerCase()),
  );

  const capaciteMatch = rawText.match(REGEX_CAPACITE);
  const capacite = capaciteMatch
    ? `${capaciteMatch[1] ?? ''} ${(capaciteMatch[2] ?? '').toUpperCase()}`.trim()
    : null;

  return {
    marque: marqueTrouvee ?? null,
    capacite,
  };
}

/**
 * Cherche un numéro explicitement libellé "S/N" (ou variantes : "SN",
 * "HDD S/N", "Serial No/Number", "ISN" chez Intel) dans le texte OCR.
 */
export function extraireNumeroSerie(rawText: string): string | null {
  const match = rawText.match(REGEX_NUMERO_SERIE);
  return match?.[1] ?? null;
}

export interface ChampEtiquette {
  label: string;
  valeur: string;
}

/**
 * Repère les champs classiques d'une étiquette de disque (Modèle, S/N, P/N,
 * Firmware, WWN, PSID...) dans le texte OCR et les renvoie dans un ORDRE
 * TOUJOURS IDENTIQUE (celui de `CHAMPS_ETIQUETTE`) — quel que soit l'ordre
 * réel, souvent désordonné, dans lequel l'OCR a restitué le texte. Utilisé
 * à la fois par la page d'édition (`ManualEntryScreen`) et l'annexe PDF pour
 * un affichage cohérent entre les deux.
 */
export function extraireChampsEtiquette(rawText: string): ChampEtiquette[] {
  const champs: ChampEtiquette[] = [];
  for (const { label, regex } of CHAMPS_ETIQUETTE) {
    const match = rawText.match(regex);
    if (match?.[1]) {
      champs.push({ label, valeur: match[1] });
    }
  }
  return champs;
}

/**
 * Normalise une chaîne pour comparaison tolérante aux confusions OCR
 * classiques (O/0, B/8, Z/2, I/L/1, S/5). Uniquement pour COMPARER deux
 * valeurs entre elles — jamais pour produire la valeur finale stockée.
 */
function normaliserPourComparaison(valeur: string): string {
  return valeur
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/O/g, '0')
    .replace(/B/g, '8')
    .replace(/Z/g, '2')
    .replace(/[IL]/g, '1')
    .replace(/S/g, '5');
}

/** Distance de Levenshtein entre deux chaînes (nombre de caractères à ajouter/retirer/changer). */
function distanceLevenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let ligne: number[] = [];
  for (let j = 0; j <= b.length; j += 1) {
    ligne.push(j);
  }

  for (let i = 1; i <= a.length; i += 1) {
    const ligneSuivante = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cout = a[i - 1] === b[j - 1] ? 0 : 1;
      ligneSuivante.push(
        Math.min(
          (ligneSuivante[j - 1] ?? Infinity) + 1,
          (ligne[j] ?? Infinity) + 1,
          (ligne[j - 1] ?? Infinity) + cout,
        ),
      );
    }
    ligne = ligneSuivante;
  }

  return ligne[b.length] ?? Math.max(a.length, b.length);
}

/** Pourcentage de correspondance entre deux chaînes (0 = totalement différentes, 1 = identiques). */
function pourcentageCorrespondance(a: string, b: string): number {
  const longueurMax = Math.max(a.length, b.length);
  if (longueurMax === 0) {
    return 1;
  }
  return 1 - distanceLevenshtein(a, b) / longueurMax;
}

export interface ResultatNumeroSerie {
  serialNumber: string | null;
  /**
   * `true` si le S/N a été confirmé par double vérification (texte "S/N"
   * de l'étiquette + un code-barres correspondant à au moins 80%). `false`
   * si on n'a qu'une seule source (pas de recoupement fiable) : la valeur
   * est quand même renvoyée pour pré-remplir, mais l'utilisateur doit
   * impérativement la vérifier.
   */
  fiable: boolean;
}

/**
 * Détermine le S/N par double vérification, jamais en devinant à l'aveugle :
 * 1. Cherche le texte explicitement libellé "S/N" (voir `extraireNumeroSerie`).
 * 2. Compare ce texte à chaque code-barres détecté sur l'étiquette (tolérant
 *    les confusions O/0, B/8, Z/2... uniquement pour la comparaison) et
 *    retient le code-barres qui correspond le mieux, à condition qu'il
 *    atteigne au moins 80% de correspondance.
 *
 * Si les deux sources ne se recoupent pas à 80% (ex : le code-barres du
 * P/N ou du PSID a été détecté à la place de celui du S/N), on ne choisit
 * PAS un code-barres au hasard : `fiable` vaut `false` et l'appelant doit
 * avertir l'utilisateur de vérifier les informations à la main.
 */
export function choisirNumeroSerie(
  codesBarresDetectes: string[],
  rawText: string,
): ResultatNumeroSerie {
  const candidatOcr = extraireNumeroSerie(rawText);

  if (candidatOcr && codesBarresDetectes.length > 0) {
    const cible = normaliserPourComparaison(candidatOcr);
    let meilleur: { valeur: string; score: number } | null = null;

    for (const code of codesBarresDetectes) {
      const score = pourcentageCorrespondance(normaliserPourComparaison(code), cible);
      if (!meilleur || score > meilleur.score) {
        meilleur = { valeur: code, score };
      }
    }

    if (meilleur && meilleur.score >= SEUIL_CORRESPONDANCE) {
      return { serialNumber: meilleur.valeur, fiable: true };
    }
  }

  if (candidatOcr) {
    // Le texte "S/N" a été trouvé mais aucun code-barres ne le confirme :
    // on le propose quand même (mieux qu'un champ vide), mais à vérifier.
    return { serialNumber: candidatOcr, fiable: false };
  }

  if (codesBarresDetectes.length > 0) {
    // Aucun texte "S/N" lisible : on ne sait pas lequel des codes-barres
    // détectés est le bon (modèle, P/N, WWN, PSID... tous se ressemblent).
    return { serialNumber: codesBarresDetectes[0] ?? null, fiable: false };
  }

  return { serialNumber: null, fiable: false };
}
