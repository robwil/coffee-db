<script lang="ts">
	import '../app.css';

	let { children } = $props();
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

	main {
		padding: 2rem 0;
	}
</style>
