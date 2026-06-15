import { getDb } from '$lib/server/db';
import type { Machine, Grinder, Dripper } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const db = getDb();

	const machineId = url.searchParams.get('machine');
	const dripperId = url.searchParams.get('dripper');
	const grinderId = url.searchParams.get('grinder');
	const roaster = url.searchParams.get('roaster');
	const origin = url.searchParams.get('origin');
	const country = url.searchParams.get('country');

	const conditions: string[] = [];
	const params: any[] = [];

	if (machineId) {
		conditions.push('eb.machine_id = ?');
		params.push(machineId);
	}
	if (dripperId) {
		conditions.push('pb.dripper_id = ?');
		params.push(dripperId);
	}
	if (grinderId) {
		conditions.push('(eb.grinder_id = ? OR pb.grinder_id = ?)');
		params.push(grinderId, grinderId);
	}
	if (roaster) {
		conditions.push('b.roaster = ?');
		params.push(roaster);
	}
	if (origin) {
		conditions.push('b.origin = ?');
		params.push(origin);
	}
	if (country) {
		conditions.push('b.roaster_country = ?');
		params.push(country);
	}

	const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

	const beansResult = await db.execute({
		sql: `SELECT DISTINCT b.*,
				(SELECT COUNT(*) FROM espresso_brews WHERE bean_id = b.id) as espresso_count,
				(SELECT COUNT(*) FROM pourover_brews WHERE bean_id = b.id) as pourover_count,
				(SELECT ROUND(AVG(rating), 1) FROM (
					SELECT rating FROM espresso_brews WHERE bean_id = b.id AND rating IS NOT NULL
					UNION ALL
					SELECT rating FROM pourover_brews WHERE bean_id = b.id AND rating IS NOT NULL
				)) as avg_rating
			FROM beans b
			LEFT JOIN espresso_brews eb ON eb.bean_id = b.id
			LEFT JOIN pourover_brews pb ON pb.bean_id = b.id
			${where}
			ORDER BY b.created_at DESC`,
		args: params
	});

	const machinesResult = await db.execute('SELECT * FROM machines ORDER BY name COLLATE NOCASE');
	const grindersResult = await db.execute('SELECT * FROM grinders ORDER BY name COLLATE NOCASE');
	const drippersResult = await db.execute('SELECT * FROM drippers ORDER BY name COLLATE NOCASE');
	const roastersResult = await db.execute(
		'SELECT DISTINCT roaster FROM beans WHERE roaster IS NOT NULL ORDER BY roaster COLLATE NOCASE'
	);
	const originsResult = await db.execute(
		'SELECT DISTINCT origin FROM beans WHERE origin IS NOT NULL ORDER BY origin COLLATE NOCASE'
	);
	const countriesResult = await db.execute(
		'SELECT DISTINCT roaster_country FROM beans WHERE roaster_country IS NOT NULL ORDER BY roaster_country COLLATE NOCASE'
	);

	return {
		beans: beansResult.rows,
		filters: {
			machines: machinesResult.rows as unknown as Machine[],
			grinders: grindersResult.rows as unknown as Grinder[],
			drippers: drippersResult.rows as unknown as Dripper[],
			roasters: roastersResult.rows.map((r: any) => r.roaster),
			origins: originsResult.rows.map((r: any) => r.origin),
			countries: countriesResult.rows.map((r: any) => r.roaster_country)
		},
		activeFilters: { machineId, dripperId, grinderId, roaster, origin, country }
	};
};
