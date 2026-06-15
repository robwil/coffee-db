import { error, fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { requireAdmin } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireAdmin(locals);
	const db = getDb();

	const result = await db.execute({
		sql: 'SELECT * FROM machines WHERE id = ?',
		args: [params.id]
	});

	const machine = result.rows[0];
	if (!machine) throw error(404, 'Machine not found');
	return { machine };
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		await requireAdmin(locals);
		const form = await request.formData();

		const name = form.get('name')?.toString().trim();
		if (!name) return fail(400, { error: 'Name is required' });

		const manufacturer = form.get('manufacturer')?.toString().trim() || null;

		const db = getDb();

		const existing = await db.execute({
			sql: 'SELECT id FROM machines WHERE id = ?',
			args: [params.id]
		});
		if (existing.rows.length === 0) throw error(404, 'Machine not found');

		await db.execute({
			sql: `UPDATE machines SET name = ?, manufacturer = ? WHERE id = ?`,
			args: [name, manufacturer, params.id]
		});

		throw redirect(303, '/admin?tab=machines');
	}
};
