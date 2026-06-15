<script lang="ts">
	import '../app.css';
	import { signIn, signOut } from '@auth/sveltekit/client';

	let { children, data } = $props();

	const session = $derived(data.session);
</script>

<svelte:head>
	<title>Coffee DB</title>
</svelte:head>

<header>
	<nav class="container">
		<a href="/" class="logo">Coffee DB</a>
		<div class="nav-links">
			<a href="/browse">Browse</a>
			<a href="/beans/new">Add Bean</a>
			{#if session?.user}
				<a href="/admin">Admin</a>
				<button class="nav-auth" onclick={() => signOut()}>Sign Out</button>
			{:else}
				<button class="nav-auth" onclick={() => signIn('google')}>Sign In</button>
			{/if}
		</div>
	</nav>
</header>

<main>
	{@render children()}
</main>

<style>
	header {
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		padding: 0.75rem 0;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.logo:hover {
		text-decoration: none;
	}

	.nav-links {
		display: flex;
		gap: 1.5rem;
	}

	@media (max-width: 768px) {
		.nav-links {
			gap: 0.75rem;
			font-size: 0.85rem;
		}
	}

	.nav-auth {
		background: none;
		border: none;
		color: var(--color-primary);
		font-size: inherit;
		padding: 0;
	}

	.nav-auth:hover {
		color: var(--color-primary-hover);
		text-decoration: underline;
	}

	main {
		padding: 2rem 0;
	}
</style>
