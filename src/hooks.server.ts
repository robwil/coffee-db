import { building, dev } from '$app/environment';
import { initSchema, seedDb } from '$lib/server/db';

if (!building && dev) {
	await initSchema();
	await seedDb();
}
