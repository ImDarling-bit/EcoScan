export type TypeDisque = 'HDD' | 'SSD' | 'NVMe';

export interface Entreprise {
  id: string;
  nom: string;
  createdAt: string;
  syncedAt: string | null;
  dirty: boolean;
}

export interface Session {
  id: string;
  entrepriseId: string;
  /** Jour de la session, format 'AAAA-MM-JJ' (indépendant de l'heure). */
  date: string;
  /** Numéro de la session pour ce jour et cette entreprise : 1, 2, 3... */
  numero: number;
  createdAt: string;
  syncedAt: string | null;
  dirty: boolean;
}

export interface Disque {
  id: string;
  serialNumber: string;
  capacity: string;
  type: TypeDisque;
  brand: string;
  entrepriseId: string;
  sessionId: string;
  /** Texte brut lu par l'OCR au moment du scan ; `null` en saisie manuelle. */
  rawText: string | null;
  createdAt: string;
  syncedAt: string | null;
  dirty: boolean;
}

export interface NouvelleEntreprise {
  nom: string;
}

export interface NouveauDisque {
  serialNumber: string;
  capacity: string;
  type: TypeDisque;
  brand: string;
  entrepriseId: string;
  rawText?: string | null;
}

export interface FiltresHistorique {
  entrepriseId?: string;
  type?: TypeDisque;
  brand?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface ScanResult {
  serialNumber: string | null;
  /** Texte OCR lu sur la photo capturée par le bouton "Scanner". */
  rawText: string | null;
  /**
   * `true` si le S/N a été confirmé par double vérification (texte "S/N" de
   * l'étiquette + un code-barres correspondant à au moins 80%). `false` si
   * l'information n'a pas pu être recoupée de façon fiable : la valeur est
   * quand même proposée, mais doit être vérifiée manuellement.
   */
  fiable: boolean;
}
