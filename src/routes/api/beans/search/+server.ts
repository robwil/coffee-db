import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();
	if (!q) return json([]);

	const db = getDb();
	const results = db
		.prepare(
			`SELECT id, name, roaster, origin, roast_level, roaster_country
			 FROM beans
			 WHERE name LIKE ? OR roaster LIKE ? OR origin LIKE ?
			 ORDER BY name COLLATE NOCASE
			 LIMIT 10`
		)
		.all(`%${q}%`, `%${q}%`, `%${q}%`);

	return json(results);
};
