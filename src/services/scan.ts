import { CommonResolutions, usePhotoOutput, type CameraPhotoOutput } from 'react-native-vision-camera';
import { processImageBarcodeScanning, processImageTextRecognition } from 'react-native-vision-camera-mlkit';

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
 * Plafonnée à `FHD_4_3` (1440×1920, ~2,8 Mpx) : l'analyse statique de
 * `react-native-vision-camera-mlkit` rejette toute image dépassant 4 Mpx ou
 * 4096px (`CommonResolutions.UHD_4_3` et au-delà provoquent une
 * `IllegalArgumentException`). C'est le résolution la plus haute disponible
 * en restant confortablement sous cette limite.
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
  const [resultatCodesBarres, resultatTexte] = await Promise.all([
    processImageBarcodeScanning(cheminPhoto, { formats: ['ALL_FORMATS'] }),
    processImageTextRecognition(cheminPhoto, { language: 'LATIN', scaleFactor: 1 }),
  ]);

  const codesBarres = resultatCodesBarres.barcodes
    .filter((barcode) => !barcode.isPotential && !!barcode.displayValue)
    .map((barcode) => barcode.displayValue as string);

  return { codesBarres, rawText: resultatTexte.text };
}
