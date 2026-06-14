import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import type { Bean, EspressoBrew, PouroverBrew } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const db = getDb();

	const bean = db.prepare('SELECT * FROM beans WHERE id = ?').get(params.id) as Bean | undefined;
	if (!bean) throw error(404, 'Bean not found');

	const espressoBrews = db
		.prepare(
			`SELECT eb.*, m.name as machine_name, m.manufacturer as machine_manufacturer, g.name as grinder_name, g.manufacturer as grinder_manufacturer
			 FROM espresso_brews eb
			 LEFT JOIN machines m ON m.id = eb.machine_id
			 LEFT JOIN grinders g ON g.id = eb.grinder_id
			 WHERE eb.bean_id = ?
			 ORDER BY eb.created_at DESC`
		)
		.all(params.id);

	const pouroverBrews = db
		.prepare(
			`SELECT pb.*, d.name as dripper_name, d.manufacturer as dripper_manufacturer, g.name as grinder_name, g.manufacturer as grinder_manufacturer
			 FROM pourover_brews pb
			 LEFT JOIN drippers d ON d.id = pb.dripper_id
			 LEFT JOIN grinders g ON g.id = pb.grinder_id
			 WHERE pb.bean_id = ?
			 ORDER BY pb.created_at DESC`
		)
		.all(params.id);

	return { bean, espressoBrews, pouroverBrews };
};
