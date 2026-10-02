import uuid from 'react-native-uuid';
import { getDatabase } from './index';
import type { Entreprise, NouvelleEntreprise } from '../types';

interface EntrepriseRow {
  id: string;
  nom: string;
  created_at: string;
  synced_at: string | null;
  dirty: number;
}

function mapRow(row: EntrepriseRow): Entreprise {
  return {
    id: row.id,
    nom: row.nom,
    createdAt: row.created_at,
    syncedAt: row.synced_at,
    dirty: row.dirty === 1,
  };
}

/**
 * Vérifie si une entreprise porte déjà ce nom (comparaison insensible à la
 * casse/aux espaces). `excludeId` permet d'ignorer l'entreprise elle-même
 * lors d'un renommage.
 */
export async function entrepriseExisteAvecNom(nom: string, excludeId?: string): Promise<boolean> {
  const db = await getDatabase();
  const { rows } = await db.execute(
    `SELECT id FROM entreprises WHERE nom = ? COLLATE NOCASE AND id != ? LIMIT 1;`,
    [nom.trim(), excludeId ?? ''],
  );
  return rows.length > 0;
}

export async function creerEntreprise(input: NouvelleEntreprise): Promise<Entreprise> {
  if (await entrepriseExisteAvecNom(input.nom)) {
    throw new Error(`Une entreprise nommée « ${input.nom.trim()} » existe déjà.`);
  }

  const db = await getDatabase();
  const id = uuid.v4() as string;
  const createdAt = new Date().toISOString();

  await db.execute(
    `INSERT INTO entreprises (id, nom, created_at, synced_at, dirty) VALUES (?, ?, ?, NULL, 1);`,
    [id, input.nom.trim(), createdAt],
  );

  return { id, nom: input.nom.trim(), createdAt, syncedAt: null, dirty: true };
}

export async function modifierEntreprise(id: string, nom: string): Promise<void> {
  if (await entrepriseExisteAvecNom(nom, id)) {
    throw new Error(`Une entreprise nommée « ${nom.trim()} » existe déjà.`);
  }

  const db = await getDatabase();
  await db.execute(`UPDATE entreprises SET nom = ?, dirty = 1 WHERE id = ?;`, [nom.trim(), id]);
}

// Les plus récentes d'abord, comme pour les disques (`listerDisquesParEntreprise`).
export async function listerEntreprises(recherche?: string): Promise<Entreprise[]> {
  const db = await getDatabase();
  const { rows } = recherche?.trim()
    ? await db.execute(`SELECT * FROM entreprises WHERE nom LIKE ? ORDER BY created_at DESC;`, [
        `%${recherche.trim()}%`,
      ])
    : await db.execute(`SELECT * FROM entreprises ORDER BY created_at DESC;`);

  return (rows as unknown as EntrepriseRow[]).map(mapRow);
}

export async function obtenirEntreprise(id: string): Promise<Entreprise | null> {
  const db = await getDatabase();
  const { rows } = await db.execute(`SELECT * FROM entreprises WHERE id = ?;`, [id]);
  const row = rows[0] as unknown as EntrepriseRow | undefined;
  return row ? mapRow(row) : null;
}

export async function supprimerEntreprise(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute(`DELETE FROM entreprises WHERE id = ?;`, [id]);
}
