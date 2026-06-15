import { redirect } from '@sveltejs/kit';

export async function requireAdmin(locals: App.Locals): Promise<void> {
	const session = await locals.auth();
	if (!session?.user) {
		throw redirect(303, '/');
	}
}
