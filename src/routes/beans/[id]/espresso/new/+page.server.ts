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
		const yieldGrams = Number(form.get('yield_grams'));
		if (!doseGrams || !yieldGrams) return fail(400, { error: 'Dose and yield are required' });

		const db = getDb();

		const beanCheck = await db.execute({
			sql: 'SELECT id FROM beans WHERE id = ?',
			args: [params.id]
		});
		if (beanCheck.rows.length === 0) throw error(404, 'Bean not found');

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
			sql: `INSERT INTO espresso_brews (bean_id, machine_id, grinder_id, dose_grams, yield_grams,
				total_time_seconds, preinfusion_time_seconds, grind_setting, rating, tasting_notes,
				days_rested, burr_set, water_temp_c, basket, pressure_profile, additional_notes, submitted_by)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			args: [
				params.id,
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
				submittedBy
			]
		});

		throw redirect(303, `/beans/${params.id}`);
	}
};
