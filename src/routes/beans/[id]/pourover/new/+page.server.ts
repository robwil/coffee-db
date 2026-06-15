import { error, fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { resolveEquipment } from '$lib/server/equipment';
import { verifyTurnstile } from '$lib/server/turnstile';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const db = getDb();
	const result = await db.execute({
		sql: 'SELECT id, name, roaster FROM beans WHERE id = ?',
		args: [params.id]
	});
	const bean = result.rows[0] as unknown as { id: string; name: string; roaster: string | null } | undefined;
	if (!bean) throw error(404, 'Bean not found');
	return { bean };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await request.formData();

		const turnstileToken = form.get('cf-turnstile-response')?.toString() || null;
		if (!(await verifyTurnstile(turnstileToken))) {
			return fail(400, { error: 'Bot verification failed. Please try again.' });
		}

		const doseGrams = Number(form.get('dose_grams'));
		if (!doseGrams) return fail(400, { error: 'Dose is required' });

		const db = getDb();

		const beanCheck = await db.execute({
			sql: 'SELECT id FROM beans WHERE id = ?',
			args: [params.id]
		});
		if (beanCheck.rows.length === 0) throw error(404, 'Bean not found');

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
			sql: `INSERT INTO pourover_brews (bean_id, dripper_id, grinder_id, dose_grams, water_grams,
				total_time_seconds, grind_setting, rating, tasting_notes, days_rested, filter_type,
				burr_set, kettle, water_temp_c, bloom_time_seconds, bloom_water_grams, pour_count,
				pour_technique, additional_notes, submitted_by)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			args: [
				params.id,
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
				submittedBy
			]
		});

		throw redirect(303, `/beans/${params.id}?tab=pourover`);
	}
};
