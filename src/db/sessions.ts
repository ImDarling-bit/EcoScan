import uuid from 'react-native-uuid';
import { getDatabase } from './index';
import type { Session } from '../types';

interface SessionRow {
  id: string;
  entreprise_id: string;
  date: string;
  numero: number;
  created_at: string;
  synced_at: string | null;
  dirty: number;
}

function mapRow(row: SessionRow): Session {
  return {
    id: row.id,
    entrepriseId: row.entreprise_id,
    date: row.date,
    numero: row.numero,
    createdAt: row.created_at,
    syncedAt: row.synced_at,
    dirty: row.dirty === 1,
  };
}

function dateDuJour(): string {
  return new Date().toISOString().slice(0, 10);
}

async function dernierNumeroDuJour(entrepriseId: string, date: string): Promise<number> {
  const db = await getDatabase();
  const { rows } = await db.execute(
    `SELECT MAX(numero) as max_numero FROM sessions WHERE entreprise_id = ? AND date = ?;`,
    [entrepriseId, date],
  );
  const row = rows[0] as { max_numero: number | null } | undefined;
  return row?.max_numero ?? 0;
}

async function creerSession(entrepriseId: string, date: string, numero: number): Promise<Session> {
  const db = await getDatabase();
  const id = uuid.v4() as string;
  const createdAt = new Date().toISOString();

  await db.execute(
    `INSERT INTO sessions (id, entreprise_id, date, numero, created_at, synced_at, dirty)
     VALUES (?, ?, ?, ?, ?, NULL, 1);`,
    [id, entrepriseId, date, numero, createdAt],
  );

  return { id, entrepriseId, date, numero, createdAt, syncedAt: null, dirty: true };
}

/**
 * Renvoie la session du jour pour cette entreprise (la crée en n1 si elle
 * n'existe pas encore). Utilisé automatiquement lors du scan/de la saisie
 * manuelle : une nouvelle session n'est créée explicitement que via
 * `creerNouvelleSession`.
 */
export async function obtenirOuCreerSessionDuJour(entrepriseId: string): Promise<Session> {
  const db = await getDatabase();
  const date = dateDuJour();

  const { rows } = await db.execute(
    `SELECT * FROM sessions WHERE entreprise_id = ? AND date = ? ORDER BY numero DESC LIMIT 1;`,
    [entrepriseId, date],
  );
  const row = rows[0] as unknown as SessionRow | undefined;
  if (row) {
    return mapRow(row);
  }

  return creerSession(entrepriseId, date, 1);
}

/**
 * Crée explicitement une nouvelle session pour aujourd'hui (n2, n3... si des
 * sessions existent déjà ce jour pour cette entreprise).
 */
export async function creerNouvelleSession(entrepriseId: string): Promise<Session> {
  const date = dateDuJour();
  const dernierNumero = await dernierNumeroDuJour(entrepriseId, date);
  return creerSession(entrepriseId, date, dernierNumero + 1);
}

export async function listerSessionsParEntreprise(entrepriseId: string): Promise<Session[]> {
  const db = await getDatabase();
  const { rows } = await db.execute(
    `SELECT * FROM sessions WHERE entreprise_id = ? ORDER BY date DESC, numero DESC;`,
    [entrepriseId],
  );

  return (rows as unknown as SessionRow[]).map(mapRow);
}

/** Formatte une session en libellé lisible, ex: "01/01/2026 - n1". */
export function formaterLibelleSession(session: Session): string {
  const [annee, mois, jour] = session.date.split('-');
  return `${jour}/${mois}/${annee} - n${session.numero}`;
}
