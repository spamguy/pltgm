import { getLogger } from '@logtape/logtape';
import { Database } from 'bun:sqlite';
import { mkdirSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const dbPath = process.env.DB_PATH ?? './data/pltgm.db';
mkdirSync(dirname(dbPath), { recursive: true });

// `strict` lets named `@params` in queries.ts bind from un-prefixed object keys.
const client = new Database(dbPath, { create: true, strict: true });
client.exec('PRAGMA journal_mode = WAL');
client.exec('PRAGMA foreign_keys = ON');

process.on('exit', () => client.close());

export function initDatabase() {
	getLogger('sqlite').info('Using DB found at {dbPath}', { dbPath: resolve(dbPath) });

	const relPath = resolve(dirname(fileURLToPath(import.meta.url)), '../scripts/migrate.sql');
	const migration = readFileSync(relPath, 'utf8');
	client.exec(migration);
}

export { client };
