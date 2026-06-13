import type Database from 'better-sqlite3';

const ALLOWED_TABLES = new Set(['machines', 'grinders', 'drippers']);

export function resolveEquipment(
	db: Database.Database,
	table: string,
	id: string | null,
	name: string | null
): string | null {
	if (!ALLOWED_TABLES.has(table)) throw new Error(`Invalid table: ${table}`);
	if (id) return id;
	if (!name) return null;

	const existing = db
		.prepare(`SELECT id FROM ${table} WHERE name = ? COLLATE NOCASE`)
		.get(name) as { id: string } | undefined;
	if (existing) return existing.id;

	const result = db
		.prepare(`INSERT INTO ${table} (name) VALUES (?) RETURNING id`)
		.get(name) as { id: string };
	return result.id;
}
