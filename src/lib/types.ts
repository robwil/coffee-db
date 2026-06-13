export interface Machine {
	id: string;
	name: string;
	manufacturer: string | null;
	created_at: string;
}

export interface Grinder {
	id: string;
	name: string;
	manufacturer: string | null;
	created_at: string;
}

export interface Dripper {
	id: string;
	name: string;
	manufacturer: string | null;
	created_at: string;
}

export interface Bean {
	id: string;
	name: string;
	roaster: string | null;
	origin: string | null;
	roast_level: number | null;
	caffeine: string;
	roaster_city: string | null;
	roaster_country: string | null;
	weight_grams: number | null;
	price: number | null;
	currency: string | null;
	product_url: string | null;
	tasting_notes: string | null;
	submitted_by: string | null;
	created_at: string;
	updated_at: string;
}

export interface EspressoBrew {
	id: string;
	bean_id: string;
	machine_id: string | null;
	grinder_id: string | null;
	dose_grams: number;
	yield_grams: number;
	total_time_seconds: number | null;
	preinfusion_time_seconds: number | null;
	grind_setting: string | null;
	rating: number | null;
	tasting_notes: string | null;
	days_rested: number | null;
	burr_set: string | null;
	water_temp_c: number | null;
	basket: string | null;
	pressure_profile: string | null;
	additional_notes: string | null;
	submitted_by: string | null;
	created_at: string;
	updated_at: string;
}

export interface PouroverBrew {
	id: string;
	bean_id: string;
	dripper_id: string | null;
	grinder_id: string | null;
	dose_grams: number;
	water_grams: number | null;
	total_time_seconds: number | null;
	grind_setting: string | null;
	rating: number | null;
	tasting_notes: string | null;
	days_rested: number | null;
	filter_type: string | null;
	burr_set: string | null;
	kettle: string | null;
	water_temp_c: number | null;
	bloom_time_seconds: number | null;
	bloom_water_grams: number | null;
	pour_count: number | null;
	pour_technique: string | null;
	additional_notes: string | null;
	submitted_by: string | null;
	created_at: string;
	updated_at: string;
}

export interface BeanWithBrewStats extends Bean {
	espresso_count: number;
	pourover_count: number;
	avg_rating: number | null;
}

export const ORIGINS = [
	'Ethiopia',
	'Colombia',
	'Brazil',
	'Kenya',
	'Guatemala',
	'Costa Rica',
	'Honduras',
	'Peru',
	'Rwanda',
	'Indonesia',
	'Panama',
	'Mexico',
	'El Salvador',
	'Nicaragua',
	'Tanzania',
	'Uganda',
	'Yemen',
	'India',
	'Vietnam',
	'Blend',
	'Other'
] as const;

export const ROAST_LEVELS = [
	{ value: 1, label: 'Very Light' },
	{ value: 2, label: 'Light' },
	{ value: 3, label: 'Medium' },
	{ value: 4, label: 'Medium-Dark' },
	{ value: 5, label: 'Dark' }
] as const;
