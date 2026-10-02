import { create } from 'zustand';
import * as sessionsDb from '../db/sessions';
import type { Session } from '../types';

interface SessionState {
  sessions: Session[];
  chargement: boolean;
  erreur: string | null;
  chargerPourEntreprise: (entrepriseId: string) => Promise<void>;
  creerNouvelleSession: (entrepriseId: string) => Promise<Session>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  chargement: false,
  erreur: null,

  chargerPourEntreprise: async (entrepriseId: string) => {
    set({ chargement: true, erreur: null });
    try {
      const sessions = await sessionsDb.listerSessionsParEntreprise(entrepriseId);
      set({ sessions, chargement: false });
    } catch (error) {
      set({ erreur: (error as Error).message, chargement: false });
    }
  },

  creerNouvelleSession: async (entrepriseId: string) => {
    const session = await sessionsDb.creerNouvelleSession(entrepriseId);
    set({ sessions: [session, ...get().sessions] });
    return session;
  },
}));
