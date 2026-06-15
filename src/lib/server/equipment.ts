import type { Client } from '@libsql/client/web';

const ALLOWED_TABLES = new Set(['machines', 'grinders', 'drippers']);

export async function resolveEquipment(
	db: Client,
	table: string,
	id: string | null,
	name: string | null,
	manufacturer: string | null = null
): Promise<string | null> {
	if (!ALLOWED_TABLES.has(table)) throw new Error(`Invalid table: ${table}`);
	if (id) return id;
	if (!name) return null;

	const existing = await db.execute({
		sql: `SELECT id FROM ${table} WHERE name = ? COLLATE NOCASE`,
		args: [name]
	});
	if (existing.rows.length > 0) return existing.rows[0].id as string;

	const result = await db.execute({
		sql: `INSERT INTO ${table} (name, manufacturer) VALUES (?, ?) RETURNING id`,
		args: [name, manufacturer]
	});
	return result.rows[0].id as string;
}
