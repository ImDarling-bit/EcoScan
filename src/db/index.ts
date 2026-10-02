import { open, type DB } from '@op-engineering/op-sqlite';
import { MIGRATIONS } from './schema';

const DATABASE_NAME = 'ecoscan.db';

let dbInstance: DB | null = null;

async function getUserVersion(db: DB): Promise<number> {
  const { rows } = await db.execute('PRAGMA user_version;');
  const row = rows[0] as { user_version: number } | undefined;
  return row?.user_version ?? 0;
}

async function setUserVersion(db: DB, version: number): Promise<void> {
  // PRAGMA n'accepte pas les paramètres liés, l'entier est donc interpolé directement.
  await db.execute(`PRAGMA user_version = ${version};`);
}

async function runMigrations(db: DB): Promise<void> {
  const currentVersion = await getUserVersion(db);
  const pending = MIGRATIONS.filter((migration) => migration.version > currentVersion).sort(
    (a, b) => a.version - b.version,
  );

  for (const migration of pending) {
    await db.executeBatch(migration.statements.map((statement) => [statement]));
    await setUserVersion(db, migration.version);
  }
}

export async function getDatabase(): Promise<DB> {
  if (dbInstance) {
    return dbInstance;
  }

  const db = open({ name: DATABASE_NAME });
  await db.execute('PRAGMA foreign_keys = ON;');
  await runMigrations(db);

  dbInstance = db;
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
