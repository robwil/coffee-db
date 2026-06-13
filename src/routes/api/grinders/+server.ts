import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();
	const db = getDb();

	if (q) {
		const results = db
			.prepare('SELECT * FROM grinders WHERE name LIKE ? ORDER BY name COLLATE NOCASE LIMIT 10')
			.all(`%${q}%`);
		return json(results);
	}

	const all = db.prepare('SELECT * FROM grinders ORDER BY name COLLATE NOCASE').all();
	return json(all);
};
