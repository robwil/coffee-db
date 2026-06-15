import { createClient, type Client } from '@libsql/client/web';
import { env } from '$env/dynamic/private';

let _client: Client | null = null;

export function getDb(): Client {
	if (_client) return _client;

	const url = env.TURSO_DATABASE_URL;
	if (!url) throw new Error('TURSO_DATABASE_URL is not set');

	_client = createClient({
		url,
		authToken: env.TURSO_AUTH_TOKEN
	});

	return _client;
}

export async function initSchema(): Promise<void> {
	const db = getDb();
	const { readFileSync } = await import('fs');
	const { fileURLToPath } = await import('url');
	const { dirname, join } = await import('path');

	const __filename = fileURLToPath(import.meta.url);
	const __dir = dirname(__filename);

	const schema = readFileSync(join(__dir, 'schema.sql'), 'utf-8');
	await db.executeMultiple(schema);

	// Backfill FTS index for any beans not yet indexed
	await db.execute({
		sql: `INSERT OR IGNORE INTO beans_fts(rowid, name, roaster, origin, tasting_notes)
			  SELECT rowid, name, roaster, origin, tasting_notes FROM beans`,
		args: []
	});
}

export async function seedDb(): Promise<void> {
	const db = getDb();

	const result = await db.execute({ sql: 'SELECT COUNT(*) as count FROM beans', args: [] });
	if (Number(result.rows[0].count) > 0) return;

	const { readFileSync } = await import('fs');
	const { fileURLToPath } = await import('url');
	const { dirname, join } = await import('path');

	const __filename = fileURLToPath(import.meta.url);
	const __dir = dirname(__filename);

	const seed = readFileSync(join(__dir, 'seed.sql'), 'utf-8');
	await db.executeMultiple(seed);
}
