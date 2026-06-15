import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();
	const db = getDb();

	if (q) {
		const result = await db.execute({
			sql: `SELECT * FROM machines WHERE name LIKE ? OR manufacturer LIKE ? OR (manufacturer || ' ' || name) LIKE ? ORDER BY name COLLATE NOCASE LIMIT 10`,
			args: [`%${q}%`, `%${q}%`, `%${q}%`]
		});
		return json(result.rows);
	}

	const result = await db.execute('SELECT * FROM machines ORDER BY name COLLATE NOCASE');
	return json(result.rows);
};
