import { CommonResolutions, usePhotoOutput, type CameraPhotoOutput } from 'react-native-vision-camera';
import { processImageBarcodeScanning, processImageTextRecognition } from 'react-native-vision-camera-mlkit';
import { Images } from 'react-native-nitro-image';

// Marge de sécurité sous la vraie limite ML Kit (4 Mpx / 4096px de côté) :
// `targetResolution` n'est qu'une préférence (voir usePhotoHauteResolution
// ci-dessous) — CameraX peut choisir un format bien plus grand selon les
// résolutions réellement disponibles sur le capteur. Observé en production
// sur un téléphone client dont le capteur a produit une photo largement
// au-dessus de FHD malgré la cible demandée, provoquant un crash au scan.
const LIMITE_PIXELS_ML_KIT = 3_800_000;
const LIMITE_DIMENSION_ML_KIT = 4000;

/**
 * Redimensionne la photo si besoin pour rester sous la limite de taille
 * statique de ML Kit, quelle que soit la résolution réellement produite par
 * l'appareil (indépendant de `targetResolution`, qui n'est qu'un souhait).
 * Ne fait rien (retourne le chemin tel quel) si la photo est déjà assez petite.
 */
async function garantirTailleCompatibleMlKit(cheminPhoto: string): Promise<string> {
  const image = await Images.loadFromFileAsync(cheminPhoto);
  const { width, height } = image;

  const facteurPixels = Math.sqrt(LIMITE_PIXELS_ML_KIT / (width * height));
  const facteurDimension = LIMITE_DIMENSION_ML_KIT / Math.max(width, height);
  const facteur = Math.min(1, facteurPixels, facteurDimension);

  if (facteur >= 1) {
    return cheminPhoto;
  }

  const redimensionnee = await image.resizeAsync(Math.round(width * facteur), Math.round(height * facteur));
  return redimensionnee.saveToTemporaryFileAsync('jpg', 90);
}

/**
 * Zone de scan portrait couvrant la quasi-totalité de l'écran : purement le
 * cadre visuel affiché à l'écran pour guider l'utilisateur (voir ScanScreen).
 * Aucun recadrage n'est appliqué à l'analyse : la photo capturée couvre déjà
 * ce que l'utilisateur a cadré dedans.
 */
export const ZONE_SCAN = { x: 0.1, y: 0.08, width: 0.8, height: 0.84 };

/**
 * Sortie photo haute résolution, déclenchée manuellement par le bouton
 * "Scanner" une fois le disque bien cadré — jamais en continu. C'est une
 * vraie photo capteur (pas une frame de prévisualisation basse résolution),
 * nécessaire pour distinguer à l'OCR des caractères ambigus (O/0, B/8, Z/2),
 * d'autant plus avec un capteur photo d'entrée de gamme.
 *
 * Cible `FHD_4_3` (1440×1920, ~2,8 Mpx) pour une bonne qualité d'OCR sans
 * capturer inutilement plus gros. Ce n'est qu'une préférence : CameraX peut
 * choisir un format bien plus grand selon les résolutions disponibles sur le
 * capteur du téléphone (observé en production sur un appareil client). La
 * limite stricte de ML Kit (4 Mpx / 4096px, voir `garantirTailleCompatibleMlKit`
 * ci-dessus) est donc appliquée après coup, pas en se fiant à cette cible.
 */
export function usePhotoHauteResolution(): CameraPhotoOutput {
  return usePhotoOutput({
    targetResolution: CommonResolutions.FHD_4_3,
    containerFormat: 'jpeg',
    quality: 0.9,
    qualityPrioritization: 'quality',
  });
}

export interface AnalysePhoto {
  /** Toutes les valeurs de codes-barres/QR codes détectées sur la photo. */
  codesBarres: string[];
  rawText: string;
}

/**
 * Analyse une photo unique (codes-barres + OCR) : les deux lectures portent
 * sur EXACTEMENT la même image haute résolution, prise au même instant —
 * contrairement à une détection en continu suivie d'une capture différée,
 * qui peut capturer un disque légèrement déplacé entre-temps et donc
 * mélanger les informations de deux prises différentes.
 */
export async function analyserPhotoDisque(cheminPhoto: string): Promise<AnalysePhoto> {
  const cheminAnalyse = await garantirTailleCompatibleMlKit(cheminPhoto);
  const [resultatCodesBarres, resultatTexte] = await Promise.all([
    processImageBarcodeScanning(cheminAnalyse, { formats: ['ALL_FORMATS'] }),
    processImageTextRecognition(cheminAnalyse, { language: 'LATIN', scaleFactor: 1 }),
  ]);

  const codesBarres = resultatCodesBarres.barcodes
    .filter((barcode) => !barcode.isPotential && !!barcode.displayValue)
    .map((barcode) => barcode.displayValue as string);

  return { codesBarres, rawText: resultatTexte.text };
}
