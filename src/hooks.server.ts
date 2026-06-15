import { building, dev } from '$app/environment';
import { sequence } from '@sveltejs/kit/hooks';
import { handle as authHandle } from './auth';
import { initSchema, seedDb } from '$lib/server/db';

if (!building && dev) {
	await initSchema();
	await seedDb();
}

export const handle = sequence(authHandle);
