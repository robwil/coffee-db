import { error, fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { requireAdmin } from '$lib/server/auth';
import { resolveEquipment } from '$lib/server/equipment';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireAdmin(locals);
	const db = getDb();

	const result = await db.execute({
		sql: `SELECT eb.*, b.name as bean_name, b.roaster as bean_roaster,
			m.name as machine_name, m.manufacturer as machine_manufacturer, m.id as current_machine_id,
			g.name as grinder_name, g.manufacturer as grinder_manufacturer, g.id as current_grinder_id
		 FROM espresso_brews eb
		 JOIN beans b ON b.id = eb.bean_id
		 LEFT JOIN machines m ON m.id = eb.machine_id
		 LEFT JOIN grinders g ON g.id = eb.grinder_id
		 WHERE eb.id = ?`,
		args: [params.id]
	});

	const brew = result.rows[0];
	if (!brew) throw error(404, 'Brew not found');
	return { brew };
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		await requireAdmin(locals);
		const form = await request.formData();

		const doseGrams = Number(form.get('dose_grams'));
		const yieldGrams = Number(form.get('yield_grams'));
		if (!doseGrams || !yieldGrams) return fail(400, { error: 'Dose and yield are required' });

		const db = getDb();

		const existing = await db.execute({
			sql: 'SELECT id FROM espresso_brews WHERE id = ?',
			args: [params.id]
		});
		if (existing.rows.length === 0) throw error(404, 'Brew not found');

		const machineId = await resolveEquipment(
			db,
			'machines',
			form.get('machine_id')?.toString() || null,
			form.get('machine_name')?.toString().trim() || null,
			form.get('machine_manufacturer')?.toString().trim() || null
		);

		const grinderId = await resolveEquipment(
			db,
			'grinders',
			form.get('grinder_id')?.toString() || null,
			form.get('grinder_name')?.toString().trim() || null,
			form.get('grinder_manufacturer')?.toString().trim() || null
		);

		const totalTime = form.get('total_time_seconds') ? Number(form.get('total_time_seconds')) : null;
		const preinfusionTime = form.get('preinfusion_time_seconds')
			? Number(form.get('preinfusion_time_seconds'))
			: null;
		const grindSetting = form.get('grind_setting')?.toString().trim() || null;
		const rating = form.get('rating') ? Number(form.get('rating')) : null;
		const tastingNotes = form.get('tasting_notes')?.toString().trim() || null;
		const daysRested = form.get('days_rested') ? Number(form.get('days_rested')) : null;
		const burrSet = form.get('burr_set')?.toString().trim() || null;
		const waterTempC = form.get('water_temp_c') ? Number(form.get('water_temp_c')) : null;
		const basket = form.get('basket')?.toString().trim() || null;
		const pressureProfile = form.get('pressure_profile')?.toString().trim() || null;
		const additionalNotes = form.get('additional_notes')?.toString().trim() || null;
		const submittedBy = form.get('submitted_by')?.toString().trim() || null;

		await db.execute({
			sql: `UPDATE espresso_brews SET
				machine_id = ?, grinder_id = ?, dose_grams = ?, yield_grams = ?,
				total_time_seconds = ?, preinfusion_time_seconds = ?, grind_setting = ?,
				rating = ?, tasting_notes = ?, days_rested = ?, burr_set = ?,
				water_temp_c = ?, basket = ?, pressure_profile = ?,
				additional_notes = ?, submitted_by = ?,
				updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
			 WHERE id = ?`,
			args: [
				machineId,
				grinderId,
				doseGrams,
				yieldGrams,
				totalTime,
				preinfusionTime,
				grindSetting,
				rating,
				tastingNotes,
				daysRested,
				burrSet,
				waterTempC,
				basket,
				pressureProfile,
				additionalNotes,
				submittedBy,
				params.id
			]
		});

		throw redirect(303, '/admin');
	}
};
