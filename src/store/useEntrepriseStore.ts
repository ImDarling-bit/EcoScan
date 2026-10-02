import { create } from 'zustand';
import * as entreprisesDb from '../db/entreprises';
import type { Entreprise, NouvelleEntreprise } from '../types';

interface EntrepriseState {
  entreprises: Entreprise[];
  chargement: boolean;
  erreur: string | null;
  charger: (recherche?: string) => Promise<void>;
  creer: (input: NouvelleEntreprise) => Promise<Entreprise>;
  modifier: (id: string, nom: string) => Promise<void>;
  supprimer: (id: string) => Promise<void>;
}

export const useEntrepriseStore = create<EntrepriseState>((set, get) => ({
  entreprises: [],
  chargement: false,
  erreur: null,

  charger: async (recherche?: string) => {
    set({ chargement: true, erreur: null });
    try {
      const entreprises = await entreprisesDb.listerEntreprises(recherche);
      set({ entreprises, chargement: false });
    } catch (error) {
      set({ erreur: (error as Error).message, chargement: false });
    }
  },

  creer: async (input: NouvelleEntreprise) => {
    const entreprise = await entreprisesDb.creerEntreprise(input);
    set({ entreprises: [entreprise, ...get().entreprises] });
    return entreprise;
  },

  modifier: async (id: string, nom: string) => {
    await entreprisesDb.modifierEntreprise(id, nom);
    // Un renommage ne change pas la date de création : on garde l'ordre
    // (les plus récentes en premier) tel quel, sans retrier par nom.
    set({
      entreprises: get().entreprises.map((e) => (e.id === id ? { ...e, nom: nom.trim() } : e)),
    });
  },

  supprimer: async (id: string) => {
    await entreprisesDb.supprimerEntreprise(id);
    set({ entreprises: get().entreprises.filter((e) => e.id !== id) });
  },
}));
