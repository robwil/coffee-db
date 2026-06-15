import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();
	if (!q) return json([]);

	const db = getDb();
	const result = await db.execute({
		sql: `SELECT id, name, roaster, origin, roast_level, roaster_country
			 FROM beans
			 WHERE name LIKE ? OR roaster LIKE ? OR origin LIKE ?
			 ORDER BY name COLLATE NOCASE
			 LIMIT 10`,
		args: [`%${q}%`, `%${q}%`, `%${q}%`]
	});

	return json(result.rows);
};
