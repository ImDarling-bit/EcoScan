import uuid from 'react-native-uuid';
import { getDatabase } from './index';
import type { Disque, FiltresHistorique, NouveauDisque, TypeDisque } from '../types';

interface DisqueRow {
  id: string;
  serial_number: string;
  capacity: string;
  type: TypeDisque;
  brand: string;
  entreprise_id: string;
  session_id: string;
  raw_text: string | null;
  created_at: string;
  synced_at: string | null;
  dirty: number;
}

function mapRow(row: DisqueRow): Disque {
  return {
    id: row.id,
    serialNumber: row.serial_number,
    capacity: row.capacity,
    type: row.type,
    brand: row.brand,
    entrepriseId: row.entreprise_id,
    sessionId: row.session_id,
    rawText: row.raw_text,
    createdAt: row.created_at,
    syncedAt: row.synced_at,
    dirty: row.dirty === 1,
  };
}

export async function creerDisque(input: NouveauDisque & { sessionId: string }): Promise<Disque> {
  const db = await getDatabase();
  const id = uuid.v4() as string;
  const createdAt = new Date().toISOString();
  const rawText = input.rawText?.trim() || null;

  await db.execute(
    `INSERT INTO disques
      (id, serial_number, capacity, type, brand, entreprise_id, session_id, raw_text, created_at, synced_at, dirty)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 1);`,
    [
      id,
      input.serialNumber.trim(),
      input.capacity.trim(),
      input.type,
      input.brand.trim(),
      input.entrepriseId,
      input.sessionId,
      rawText,
      createdAt,
    ],
  );

  return {
    id,
    serialNumber: input.serialNumber.trim(),
    capacity: input.capacity.trim(),
    type: input.type,
    brand: input.brand.trim(),
    entrepriseId: input.entrepriseId,
    sessionId: input.sessionId,
    rawText,
    createdAt,
    syncedAt: null,
    dirty: true,
  };
}

export async function obtenirDisque(id: string): Promise<Disque | null> {
  const db = await getDatabase();
  const { rows } = await db.execute(`SELECT * FROM disques WHERE id = ?;`, [id]);
  const row = rows[0] as unknown as DisqueRow | undefined;
  return row ? mapRow(row) : null;
}

export interface ModificationDisque {
  serialNumber: string;
  capacity: string;
  type: TypeDisque;
  brand: string;
}

export async function modifierDisque(id: string, input: ModificationDisque): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    `UPDATE disques SET serial_number = ?, capacity = ?, type = ?, brand = ?, dirty = 1 WHERE id = ?;`,
    [input.serialNumber.trim(), input.capacity.trim(), input.type, input.brand.trim(), id],
  );
}

export async function listerDisquesParEntreprise(entrepriseId: string): Promise<Disque[]> {
  const db = await getDatabase();
  const { rows } = await db.execute(
    `SELECT * FROM disques WHERE entreprise_id = ? ORDER BY created_at DESC;`,
    [entrepriseId],
  );

  return (rows as unknown as DisqueRow[]).map(mapRow);
}

export async function listerHistorique(filtres: FiltresHistorique = {}): Promise<Disque[]> {
  const db = await getDatabase();
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filtres.entrepriseId) {
    conditions.push('entreprise_id = ?');
    params.push(filtres.entrepriseId);
  }
  if (filtres.type) {
    conditions.push('type = ?');
    params.push(filtres.type);
  }
  if (filtres.brand) {
    conditions.push('brand LIKE ?');
    params.push(`%${filtres.brand}%`);
  }
  if (filtres.dateDebut) {
    conditions.push('created_at >= ?');
    params.push(filtres.dateDebut);
  }
  if (filtres.dateFin) {
    conditions.push('created_at <= ?');
    params.push(filtres.dateFin);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await db.execute(`SELECT * FROM disques ${where} ORDER BY created_at DESC;`, params);

  return (rows as unknown as DisqueRow[]).map(mapRow);
}

export async function supprimerDisque(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute(`DELETE FROM disques WHERE id = ?;`, [id]);
}
