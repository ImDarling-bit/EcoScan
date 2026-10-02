import { create } from 'zustand';
import * as disquesDb from '../db/disques';
import type { ModificationDisque } from '../db/disques';
import { obtenirOuCreerSessionDuJour } from '../db/sessions';
import type { Disque, FiltresHistorique, NouveauDisque } from '../types';

interface DisqueState {
  disquesEntreprise: Disque[];
  historique: Disque[];
  chargement: boolean;
  erreur: string | null;
  chargerPourEntreprise: (entrepriseId: string) => Promise<void>;
  chargerHistorique: (filtres?: FiltresHistorique) => Promise<void>;
  creer: (input: NouveauDisque) => Promise<Disque>;
  modifier: (id: string, input: ModificationDisque) => Promise<void>;
  supprimer: (id: string) => Promise<void>;
}

export const useDisqueStore = create<DisqueState>((set, get) => ({
  disquesEntreprise: [],
  historique: [],
  chargement: false,
  erreur: null,

  chargerPourEntreprise: async (entrepriseId: string) => {
    set({ chargement: true, erreur: null });
    try {
      const disquesEntreprise = await disquesDb.listerDisquesParEntreprise(entrepriseId);
      set({ disquesEntreprise, chargement: false });
    } catch (error) {
      set({ erreur: (error as Error).message, chargement: false });
    }
  },

  chargerHistorique: async (filtres: FiltresHistorique = {}) => {
    set({ chargement: true, erreur: null });
    try {
      const historique = await disquesDb.listerHistorique(filtres);
      set({ historique, chargement: false });
    } catch (error) {
      set({ erreur: (error as Error).message, chargement: false });
    }
  },

  creer: async (input: NouveauDisque) => {
    // Rattache automatiquement le disque à la session du jour pour cette
    // entreprise (créée en n1 si elle n'existe pas encore). Pour démarrer une
    // nouvelle session (n2, n3...) le même jour, voir useSessionStore.
    const session = await obtenirOuCreerSessionDuJour(input.entrepriseId);
    const disque = await disquesDb.creerDisque({ ...input, sessionId: session.id });
    set({ disquesEntreprise: [disque, ...get().disquesEntreprise] });
    return disque;
  },

  modifier: async (id: string, input: ModificationDisque) => {
    await disquesDb.modifierDisque(id, input);
    const fusionner = (disque: Disque) => (disque.id === id ? { ...disque, ...input } : disque);
    set({
      disquesEntreprise: get().disquesEntreprise.map(fusionner),
      historique: get().historique.map(fusionner),
    });
  },

  supprimer: async (id: string) => {
    await disquesDb.supprimerDisque(id);
    set({
      disquesEntreprise: get().disquesEntreprise.filter((d) => d.id !== id),
      historique: get().historique.filter((d) => d.id !== id),
    });
  },
}));
