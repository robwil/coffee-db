import { error, fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { requireAdmin } from '$lib/server/auth';
import { resolveEquipment } from '$lib/server/equipment';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireAdmin(locals);
	const db = getDb();

	const result = await db.execute({
		sql: `SELECT pb.*, b.name as bean_name, b.roaster as bean_roaster,
			d.name as dripper_name, d.manufacturer as dripper_manufacturer, d.id as current_dripper_id,
			g.name as grinder_name, g.manufacturer as grinder_manufacturer, g.id as current_grinder_id
		 FROM pourover_brews pb
		 JOIN beans b ON b.id = pb.bean_id
		 LEFT JOIN drippers d ON d.id = pb.dripper_id
		 LEFT JOIN grinders g ON g.id = pb.grinder_id
		 WHERE pb.id = ?`,
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
		if (!doseGrams) return fail(400, { error: 'Dose is required' });

		const db = getDb();

		const existing = await db.execute({
			sql: 'SELECT id FROM pourover_brews WHERE id = ?',
			args: [params.id]
		});
		if (existing.rows.length === 0) throw error(404, 'Brew not found');

		const dripperId = await resolveEquipment(
			db,
			'drippers',
			form.get('dripper_id')?.toString() || null,
			form.get('dripper_name')?.toString().trim() || null,
			form.get('dripper_manufacturer')?.toString().trim() || null
		);

		const grinderId = await resolveEquipment(
			db,
			'grinders',
			form.get('grinder_id')?.toString() || null,
			form.get('grinder_name')?.toString().trim() || null,
			form.get('grinder_manufacturer')?.toString().trim() || null
		);

		const waterGrams = form.get('water_grams') ? Number(form.get('water_grams')) : null;
		const totalTime = form.get('total_time_seconds') ? Number(form.get('total_time_seconds')) : null;
		const grindSetting = form.get('grind_setting')?.toString().trim() || null;
		const rating = form.get('rating') ? Number(form.get('rating')) : null;
		const tastingNotes = form.get('tasting_notes')?.toString().trim() || null;
		const daysRested = form.get('days_rested') ? Number(form.get('days_rested')) : null;
		const filterType = form.get('filter_type')?.toString() || null;
		const burrSet = form.get('burr_set')?.toString().trim() || null;
		const kettle = form.get('kettle')?.toString().trim() || null;
		const waterTempC = form.get('water_temp_c') ? Number(form.get('water_temp_c')) : null;
		const bloomTime = form.get('bloom_time_seconds') ? Number(form.get('bloom_time_seconds')) : null;
		const bloomWater = form.get('bloom_water_grams') ? Number(form.get('bloom_water_grams')) : null;
		const pourCount = form.get('pour_count') ? Number(form.get('pour_count')) : null;
		const pourTechnique = form.get('pour_technique')?.toString().trim() || null;
		const additionalNotes = form.get('additional_notes')?.toString().trim() || null;
		const submittedBy = form.get('submitted_by')?.toString().trim() || null;

		await db.execute({
			sql: `UPDATE pourover_brews SET
				dripper_id = ?, grinder_id = ?, dose_grams = ?, water_grams = ?,
				total_time_seconds = ?, grind_setting = ?, rating = ?, tasting_notes = ?,
				days_rested = ?, filter_type = ?, burr_set = ?, kettle = ?,
				water_temp_c = ?, bloom_time_seconds = ?, bloom_water_grams = ?,
				pour_count = ?, pour_technique = ?, additional_notes = ?, submitted_by = ?,
				updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
			 WHERE id = ?`,
			args: [
				dripperId,
				grinderId,
				doseGrams,
				waterGrams,
				totalTime,
				grindSetting,
				rating,
				tastingNotes,
				daysRested,
				filterType,
				burrSet,
				kettle,
				waterTempC,
				bloomTime,
				bloomWater,
				pourCount,
				pourTechnique,
				additionalNotes,
				submittedBy,
				params.id
			]
		});

		throw redirect(303, '/admin');
	}
};
