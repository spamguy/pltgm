import { getLogger } from '@logtape/logtape';
import SqlDatabase from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const dbPath = process.env.DB_PATH ?? './data/pltgm.db';
mkdirSync(dirname(dbPath), { recursive: true });

const client = new SqlDatabase(dbPath, {
	verbose: (message) => {
		const m = message as string;

		// Skip dictionary build messages.
		if (!m.includes('INTO dictionary') && !['BEGIN', 'COMMIT'].includes(m)) {
			getLogger('sqlite').debug(m);
		}
	},
});
client.pragma('journal_mode = WAL');
client.pragma('foreign_keys = ON');

process.on('exit', () => client.close());

export function initDatabase() {
	const relPath = resolve(dirname(fileURLToPath(import.meta.url)), '../scripts/migrate.sql');
	const migration = readFileSync(relPath, 'utf8');
	client.exec(migration);
}

export { client };
