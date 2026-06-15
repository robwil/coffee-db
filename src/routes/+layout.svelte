<script lang="ts">
	import '../app.css';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { navigating } from '$app/stores';

	let { children, data } = $props();

	const session = $derived(data.session);
</script>

<svelte:head>
	<title>Coffee DB</title>
</svelte:head>

{#if $navigating}
	<div class="nav-progress" aria-hidden="true"></div>
{/if}

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
	.nav-progress {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--color-primary);
		z-index: 100;
		animation: progress 1s ease-in-out infinite;
	}

	@keyframes progress {
		0% { transform: scaleX(0); transform-origin: left; }
		50% { transform: scaleX(0.7); transform-origin: left; }
		100% { transform: scaleX(1); transform-origin: left; }
	}

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
