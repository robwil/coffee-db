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

	const beansResult = await db.execute({
		sql: `SELECT b.*,
			(SELECT COUNT(*) FROM espresso_brews WHERE bean_id = b.id) as espresso_count,
			(SELECT COUNT(*) FROM pourover_brews WHERE bean_id = b.id) as pourover_count
		 FROM beans b
		 ORDER BY b.created_at DESC`,
		args: []
	});

	const machinesResult = await db.execute({
		sql: `SELECT m.*,
			(SELECT COUNT(*) FROM espresso_brews WHERE machine_id = m.id) as brew_count
		 FROM machines m
		 ORDER BY m.name COLLATE NOCASE`,
		args: []
	});

	const grindersResult = await db.execute({
		sql: `SELECT g.*,
			(SELECT COUNT(*) FROM espresso_brews WHERE grinder_id = g.id) as espresso_count,
			(SELECT COUNT(*) FROM pourover_brews WHERE grinder_id = g.id) as pourover_count
		 FROM grinders g
		 ORDER BY g.name COLLATE NOCASE`,
		args: []
	});

	const drippersResult = await db.execute({
		sql: `SELECT d.*,
			(SELECT COUNT(*) FROM pourover_brews WHERE dripper_id = d.id) as brew_count
		 FROM drippers d
		 ORDER BY d.name COLLATE NOCASE`,
		args: []
	});

	return {
		espressoBrews: espressoResult.rows,
		pouroverBrews: pouroverResult.rows,
		beans: beansResult.rows,
		machines: machinesResult.rows,
		grinders: grindersResult.rows,
		drippers: drippersResult.rows
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
	},

	deleteBean: async ({ locals, request }) => {
		await requireAdmin(locals);
		const form = await request.formData();
		const id = form.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing bean id' });

		const db = getDb();
		// Delete associated brews first (foreign key constraint)
		await db.execute({ sql: 'DELETE FROM espresso_brews WHERE bean_id = ?', args: [id] });
		await db.execute({ sql: 'DELETE FROM pourover_brews WHERE bean_id = ?', args: [id] });
		await db.execute({ sql: 'DELETE FROM beans WHERE id = ?', args: [id] });
		return { deleted: true };
	},

	deleteMachine: async ({ locals, request }) => {
		await requireAdmin(locals);
		const form = await request.formData();
		const id = form.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing machine id' });

		const db = getDb();
		const refs = await db.execute({
			sql: 'SELECT COUNT(*) as cnt FROM espresso_brews WHERE machine_id = ?',
			args: [id]
		});
		if (Number(refs.rows[0].cnt) > 0) {
			return fail(400, { error: 'Cannot delete: machine is referenced by brews' });
		}

		await db.execute({ sql: 'DELETE FROM machines WHERE id = ?', args: [id] });
		return { deleted: true };
	},

	deleteGrinder: async ({ locals, request }) => {
		await requireAdmin(locals);
		const form = await request.formData();
		const id = form.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing grinder id' });

		const db = getDb();
		const espressoRefs = await db.execute({
			sql: 'SELECT COUNT(*) as cnt FROM espresso_brews WHERE grinder_id = ?',
			args: [id]
		});
		const pouroverRefs = await db.execute({
			sql: 'SELECT COUNT(*) as cnt FROM pourover_brews WHERE grinder_id = ?',
			args: [id]
		});
		if (Number(espressoRefs.rows[0].cnt) + Number(pouroverRefs.rows[0].cnt) > 0) {
			return fail(400, { error: 'Cannot delete: grinder is referenced by brews' });
		}

		await db.execute({ sql: 'DELETE FROM grinders WHERE id = ?', args: [id] });
		return { deleted: true };
	},

	deleteDripper: async ({ locals, request }) => {
		await requireAdmin(locals);
		const form = await request.formData();
		const id = form.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing dripper id' });

		const db = getDb();
		const refs = await db.execute({
			sql: 'SELECT COUNT(*) as cnt FROM pourover_brews WHERE dripper_id = ?',
			args: [id]
		});
		if (Number(refs.rows[0].cnt) > 0) {
			return fail(400, { error: 'Cannot delete: dripper is referenced by brews' });
		}

		await db.execute({ sql: 'DELETE FROM drippers WHERE id = ?', args: [id] });
		return { deleted: true };
	},

	findUnusedMachines: async ({ locals }) => {
		await requireAdmin(locals);
		const db = getDb();
		const result = await db.execute({
			sql: `DELETE FROM machines WHERE id NOT IN (
				SELECT DISTINCT machine_id FROM espresso_brews WHERE machine_id IS NOT NULL
			)`,
			args: []
		});
		return { purged: 'machines', count: result.rowsAffected };
	},

	findUnusedGrinders: async ({ locals }) => {
		await requireAdmin(locals);
		const db = getDb();
		const result = await db.execute({
			sql: `DELETE FROM grinders WHERE id NOT IN (
				SELECT DISTINCT grinder_id FROM espresso_brews WHERE grinder_id IS NOT NULL
				UNION
				SELECT DISTINCT grinder_id FROM pourover_brews WHERE grinder_id IS NOT NULL
			)`,
			args: []
		});
		return { purged: 'grinders', count: result.rowsAffected };
	},

	findUnusedDrippers: async ({ locals }) => {
		await requireAdmin(locals);
		const db = getDb();
		const result = await db.execute({
			sql: `DELETE FROM drippers WHERE id NOT IN (
				SELECT DISTINCT dripper_id FROM pourover_brews WHERE dripper_id IS NOT NULL
			)`,
			args: []
		});
		return { purged: 'drippers', count: result.rowsAffected };
	}
};
