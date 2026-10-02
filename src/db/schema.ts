export interface Migration {
  version: number;
  statements: string[];
}

// Chaque disque et chaque entreprise porte `synced_at` (date de dernière synchro
// avec le desktop) et `dirty` (1 = modifié localement depuis la dernière synchro).
// Aucune synchro n'est implémentée dans cette itération : ces colonnes préparent
// uniquement le terrain pour la suivante.
export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS entreprises (
        id TEXT PRIMARY KEY NOT NULL,
        nom TEXT NOT NULL,
        created_at TEXT NOT NULL,
        synced_at TEXT,
        dirty INTEGER NOT NULL DEFAULT 1
      );`,
      `CREATE TABLE IF NOT EXISTS disques (
        id TEXT PRIMARY KEY NOT NULL,
        serial_number TEXT NOT NULL,
        capacity TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('HDD', 'SSD', 'NVMe')),
        brand TEXT NOT NULL,
        entreprise_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        synced_at TEXT,
        dirty INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_disques_entreprise_id ON disques(entreprise_id);`,
      `CREATE INDEX IF NOT EXISTS idx_disques_type ON disques(type);`,
      `CREATE INDEX IF NOT EXISTS idx_disques_brand ON disques(brand);`,
      `CREATE INDEX IF NOT EXISTS idx_disques_created_at ON disques(created_at);`,
      `CREATE INDEX IF NOT EXISTS idx_disques_serial_number ON disques(serial_number);`,
    ],
  },
  {
    // Regroupe les disques scannés en sessions de travail (une visite chez le
    // client) : plusieurs sessions possibles le même jour pour une même
    // entreprise (numérotées n1, n2...), une par jour par défaut sinon.
    version: 2,
    statements: [
      `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY NOT NULL,
        entreprise_id TEXT NOT NULL,
        date TEXT NOT NULL,
        numero INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        synced_at TEXT,
        dirty INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_entreprise_date_numero ON sessions(entreprise_id, date, numero);`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_entreprise_id ON sessions(entreprise_id);`,
      `ALTER TABLE disques ADD COLUMN session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE;`,
      `CREATE INDEX IF NOT EXISTS idx_disques_session_id ON disques(session_id);`,
    ],
  },
  {
    // Conserve le texte brut lu par l'OCR au moment du scan (NULL en saisie
    // manuelle), pour l'annexe détaillée optionnelle de l'export PDF.
    version: 3,
    statements: [`ALTER TABLE disques ADD COLUMN raw_text TEXT;`],
  },
];
