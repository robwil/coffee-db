<script lang="ts">
	import type { PageData } from './$types';
	import BeanCard from '$lib/components/BeanCard.svelte';
	import Spinner from '$lib/components/Spinner.svelte';

	let { data }: { data: PageData } = $props();
	let searchQuery = $state('');
	let searchResults = $state<any[]>([]);
	let searching = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout>;

	function handleSearch() {
		clearTimeout(searchTimeout);
		if (!searchQuery.trim()) {
			searchResults = [];
			return;
		}
		searchTimeout = setTimeout(async () => {
			searching = true;
			const res = await fetch(`/api/beans/search?q=${encodeURIComponent(searchQuery)}`);
			searchResults = await res.json();
			searching = false;
		}, 250);
	}
</script>

<div class="container">
	<section class="hero">
		<h1>Coffee DB</h1>
		<p class="subtitle">Community espresso & pourover recipes for every bean</p>

		<div class="search-wrapper">
			<input
				type="search"
				placeholder="Search beans by name, roaster, or origin..."
				bind:value={searchQuery}
				oninput={handleSearch}
				class="search-input"
			/>
			{#if searching}
				<div class="search-dropdown">
					<div class="search-result no-results"><Spinner size="0.9rem" /> Searching...</div>
				</div>
			{:else if searchResults.length > 0}
				<div class="search-dropdown">
					{#each searchResults as bean}
						<a href="/beans/{bean.id}" class="search-result">
							<strong>{bean.name}</strong>
							{#if bean.roaster}
								<span class="muted">by {bean.roaster}</span>
							{/if}
							{#if bean.origin}
								<span class="tag">{bean.origin}</span>
							{/if}
						</a>
					{/each}
					<a href="/beans/new" class="search-result add-new">
						+ Add a new bean
					</a>
				</div>
			{:else if searchQuery.trim() && !searching}
				<div class="search-dropdown">
					<div class="search-result no-results">
						<span>No beans found</span>
						<a href="/beans/new">Add this bean</a>
					</div>
				</div>
			{/if}
		</div>
	</section>

	<section class="stats-row">
		<div class="stat">
			<span class="stat-value">{data.stats.bean_count}</span>
			<span class="stat-label">Beans</span>
		</div>
		<div class="stat">
			<span class="stat-value">{data.stats.brew_count}</span>
			<span class="stat-label">Recipes</span>
		</div>
		<div class="stat">
			<span class="stat-value">{data.stats.roaster_count}</span>
			<span class="stat-label">Roasters</span>
		</div>
	</section>

	<section class="recent">
		<div class="section-header">
			<h2>Recent Beans</h2>
			<a href="/browse" class="btn btn-secondary">Browse All</a>
		</div>
		<div class="bean-grid">
			{#each data.recentBeans as bean}
				<BeanCard {bean} />
			{/each}
		</div>
	</section>
</div>

<style>
	.hero {
		text-align: center;
		padding: 3rem 0 2rem;
	}

	h1 {
		font-size: 2.5rem;
		color: var(--color-primary);
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: var(--color-text-muted);
		font-size: 1.1rem;
		margin-bottom: 2rem;
	}

	.search-wrapper {
		position: relative;
		max-width: 500px;
		margin: 0 auto;
	}

	.search-input {
		font-size: 1.05rem;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow);
	}

	.search-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		margin-top: 0.25rem;
		z-index: 20;
		overflow: hidden;
	}

	.search-result {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.65rem 1rem;
		color: var(--color-text);
		text-decoration: none;
	}

	.search-result:hover {
		background: var(--color-border-light);
		text-decoration: none;
	}

	.muted {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.no-results {
		justify-content: space-between;
		color: var(--color-text-muted);
	}

	.add-new {
		border-top: 1px solid var(--color-border-light);
		color: var(--color-primary);
		font-weight: 500;
	}

	.stats-row {
		display: flex;
		justify-content: center;
		gap: 3rem;
		padding: 1.5rem 0;
		border-bottom: 1px solid var(--color-border-light);
		margin-bottom: 2rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-value {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.stat-label {
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.bean-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}
</style>
