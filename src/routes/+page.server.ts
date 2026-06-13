import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const db = getDb();

	const recentBeans = db.prepare(`
		SELECT b.*,
			(SELECT COUNT(*) FROM espresso_brews WHERE bean_id = b.id) as espresso_count,
			(SELECT COUNT(*) FROM pourover_brews WHERE bean_id = b.id) as pourover_count,
			(SELECT ROUND(AVG(rating), 1) FROM (
				SELECT rating FROM espresso_brews WHERE bean_id = b.id AND rating IS NOT NULL
				UNION ALL
				SELECT rating FROM pourover_brews WHERE bean_id = b.id AND rating IS NOT NULL
			)) as avg_rating
		FROM beans b
		ORDER BY b.created_at DESC
		LIMIT 10
	`).all();

	const stats = db.prepare(`
		SELECT
			(SELECT COUNT(*) FROM beans) as bean_count,
			(SELECT COUNT(*) FROM espresso_brews) + (SELECT COUNT(*) FROM pourover_brews) as brew_count,
			(SELECT COUNT(DISTINCT roaster) FROM beans WHERE roaster IS NOT NULL) as roaster_count
	`).get() as { bean_count: number; brew_count: number; roaster_count: number };

	return { recentBeans, stats };
};
