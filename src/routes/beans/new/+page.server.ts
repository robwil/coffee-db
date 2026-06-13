import { fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();

		const name = form.get('name')?.toString().trim();
		if (!name) return fail(400, { error: 'Bean name is required' });

		const roaster = form.get('roaster')?.toString().trim() || null;
		const origin = form.get('origin')?.toString().trim() || null;
		const roastLevel = form.get('roast_level') ? Number(form.get('roast_level')) : null;
		const roasterCountry = form.get('roaster_country')?.toString().trim() || null;
		const caffeine = form.get('caffeine')?.toString() || 'full';
		const roasterCity = form.get('roaster_city')?.toString().trim() || null;
		const weightGrams = form.get('weight_grams') ? Number(form.get('weight_grams')) : null;
		const price = form.get('price') ? Number(form.get('price')) : null;
		const currency = form.get('currency')?.toString().trim() || null;
		const productUrl = form.get('product_url')?.toString().trim() || null;
		const tastingNotes = form.get('tasting_notes')?.toString().trim() || null;
		const submittedBy = form.get('submitted_by')?.toString().trim() || null;

		const db = getDb();
		const result = db
			.prepare(
				`INSERT INTO beans (name, roaster, origin, roast_level, caffeine, roaster_city, roaster_country, weight_grams, price, currency, product_url, tasting_notes, submitted_by)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				 RETURNING id`
			)
			.get(
				name,
				roaster,
				origin,
				roastLevel,
				caffeine,
				roasterCity,
				roasterCountry,
				weightGrams,
				price,
				currency,
				productUrl,
				tastingNotes,
				submittedBy
			) as { id: string };

		throw redirect(303, `/beans/${result.id}`);
	}
};
