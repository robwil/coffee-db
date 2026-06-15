import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import type { Bean } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const db = getDb();

	const beanResult = await db.execute({
		sql: 'SELECT * FROM beans WHERE id = ?',
		args: [params.id]
	});
	const bean = beanResult.rows[0] as unknown as Bean | undefined;
	if (!bean) throw error(404, 'Bean not found');

	const espressoResult = await db.execute({
		sql: `SELECT eb.*, m.name as machine_name, m.manufacturer as machine_manufacturer, g.name as grinder_name, g.manufacturer as grinder_manufacturer
			 FROM espresso_brews eb
			 LEFT JOIN machines m ON m.id = eb.machine_id
			 LEFT JOIN grinders g ON g.id = eb.grinder_id
			 WHERE eb.bean_id = ?
			 ORDER BY eb.created_at DESC`,
		args: [params.id]
	});

	const pouroverResult = await db.execute({
		sql: `SELECT pb.*, d.name as dripper_name, d.manufacturer as dripper_manufacturer, g.name as grinder_name, g.manufacturer as grinder_manufacturer
			 FROM pourover_brews pb
			 LEFT JOIN drippers d ON d.id = pb.dripper_id
			 LEFT JOIN grinders g ON g.id = pb.grinder_id
			 WHERE pb.bean_id = ?
			 ORDER BY pb.created_at DESC`,
		args: [params.id]
	});

	return {
		bean,
		espressoBrews: espressoResult.rows,
		pouroverBrews: pouroverResult.rows
	};
};
