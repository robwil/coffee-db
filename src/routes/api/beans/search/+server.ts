import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();
	if (!q) return json([]);

	const db = getDb();

	// Use FTS5 MATCH with prefix search, falling back to LIKE for substring matches
	const ftsQuery = q.replace(/"/g, '""') + '*';
	const result = await db.execute({
		sql: `SELECT b.id, b.name, b.roaster, b.origin, b.roast_level, b.roaster_country
			 FROM beans_fts fts
			 JOIN beans b ON b.rowid = fts.rowid
			 WHERE beans_fts MATCH ?
			 UNION
			 SELECT id, name, roaster, origin, roast_level, roaster_country
			 FROM beans
			 WHERE name LIKE ? OR roaster LIKE ? OR origin LIKE ?
			 ORDER BY name COLLATE NOCASE
			 LIMIT 10`,
		args: [ftsQuery, `%${q}%`, `%${q}%`, `%${q}%`]
	});

	return json(result.rows);
};
