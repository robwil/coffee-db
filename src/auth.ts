import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import { env } from '$env/dynamic/private';

const adminEmails = () =>
	(env.ADMIN_EMAILS ?? '')
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);

export const { handle, signIn, signOut } = SvelteKitAuth({
	trustHost: true,
	providers: [Google],
	callbacks: {
		signIn({ profile }) {
			const email = profile?.email?.toLowerCase();
			if (!email || !adminEmails().includes(email)) return false;
			return true;
		},
		session({ session }) {
			return session;
		}
	}
});
