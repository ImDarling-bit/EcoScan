import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TypeDisque } from '../types';

export type EntreprisesStackParamList = {
  EntrepriseListe: undefined;
  EntrepriseDetail: { entrepriseId: string; nom: string };
  Scan: { entrepriseId: string; entrepriseNom: string; type: TypeDisque };
  SaisieManuelle: {
    entrepriseId: string;
    entrepriseNom: string;
    type: TypeDisque;
    prefill?: {
      serialNumber: string;
      rawText: string | null;
    };
    /** Présent uniquement en mode édition : modifie ce disque au lieu d'en créer un nouveau. */
    disqueId?: string;
  };
  ExportPdfSessions: { entrepriseId: string; entrepriseNom: string };
  ExportPdfApercu: { cheminFichier: string; entrepriseNom: string };
};

export type HistoriqueStackParamList = {
  Historique: undefined;
};

export type RootTabParamList = {
  EntreprisesTab: NavigatorScreenParams<EntreprisesStackParamList>;
  HistoriqueTab: NavigatorScreenParams<HistoriqueStackParamList>;
};

export type EntreprisesScreenProps<T extends keyof EntreprisesStackParamList> =
  NativeStackScreenProps<EntreprisesStackParamList, T>;

export type HistoriqueScreenProps<T extends keyof HistoriqueStackParamList> =
  NativeStackScreenProps<HistoriqueStackParamList, T>;
