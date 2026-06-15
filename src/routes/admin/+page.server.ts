import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { requireAdmin } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	await requireAdmin(locals);
	const db = getDb();

	const espressoResult = await db.execute({
		sql: `SELECT eb.*, b.name as bean_name, b.roaster as bean_roaster,
			m.name as machine_name, g.name as grinder_name
		 FROM espresso_brews eb
		 JOIN beans b ON b.id = eb.bean_id
		 LEFT JOIN machines m ON m.id = eb.machine_id
		 LEFT JOIN grinders g ON g.id = eb.grinder_id
		 ORDER BY eb.created_at DESC`,
		args: []
	});

	const pouroverResult = await db.execute({
		sql: `SELECT pb.*, b.name as bean_name, b.roaster as bean_roaster,
			d.name as dripper_name, g.name as grinder_name
		 FROM pourover_brews pb
		 JOIN beans b ON b.id = pb.bean_id
		 LEFT JOIN drippers d ON d.id = pb.dripper_id
		 LEFT JOIN grinders g ON g.id = pb.grinder_id
		 ORDER BY pb.created_at DESC`,
		args: []
	});

	return {
		espressoBrews: espressoResult.rows,
		pouroverBrews: pouroverResult.rows
	};
};

export const actions: Actions = {
	deleteEspresso: async ({ locals, request }) => {
		await requireAdmin(locals);
		const form = await request.formData();
		const id = form.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing brew id' });

		const db = getDb();
		await db.execute({ sql: 'DELETE FROM espresso_brews WHERE id = ?', args: [id] });
		return { deleted: true };
	},

	deletePourover: async ({ locals, request }) => {
		await requireAdmin(locals);
		const form = await request.formData();
		const id = form.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing brew id' });

		const db = getDb();
		await db.execute({ sql: 'DELETE FROM pourover_brews WHERE id = ?', args: [id] });
		return { deleted: true };
	}
};
