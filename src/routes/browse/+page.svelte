<script lang="ts">
	import type { PageData } from './$types';
	import type { Machine, Grinder, Dripper } from '$lib/types';
	import BeanCard from '$lib/components/BeanCard.svelte';

	let { data }: { data: PageData } = $props();

	const machines = $derived(data.filters.machines as unknown as Machine[]);
	const grinders = $derived(data.filters.grinders as unknown as Grinder[]);
	const drippers = $derived(data.filters.drippers as unknown as Dripper[]);

	function buildUrl(param: string, value: string | null): string {
		const params = new URLSearchParams();
		const current = data.activeFilters;

		const mapping: Record<string, string | null> = {
			machine: current.machineId,
			dripper: current.dripperId,
			grinder: current.grinderId,
			roaster: current.roaster,
			origin: current.origin,
			country: current.country
		};

		for (const [key, val] of Object.entries(mapping)) {
			if (key === param) {
				if (value) params.set(key, value);
			} else if (val) {
				params.set(key, val);
			}
		}

		const qs = params.toString();
		return `/browse${qs ? '?' + qs : ''}`;
	}

	const hasFilters = $derived(
		Object.values(data.activeFilters).some((v) => v !== null)
	);

	const activeFilterCount = $derived(
		Object.values(data.activeFilters).filter((v) => v !== null).length
	);
</script>

<svelte:head>
	<style>
		@media (min-width: 769px) {
			.filter-accordion { display: none !important; }
			.filters { display: grid !important; }
		}
	</style>
</svelte:head>

<div class="container">
	<h1>Browse Beans</h1>

	<details class="filter-details">
		<summary class="filter-accordion">
			Filters{#if activeFilterCount > 0} <span class="filter-badge">{activeFilterCount}</span>{/if}
		</summary>

	<div class="filters">
		<div class="filter-group">
			<label for="filter-machine">Machine</label>
			<select
				id="filter-machine"
				onchange={(e) => {
					const val = (e.target as HTMLSelectElement).value;
					window.location.href = buildUrl('machine', val || null);
				}}
			>
				<option value="">All machines</option>
				{#each machines as machine}
					<option value={machine.id} selected={data.activeFilters.machineId === machine.id}>
						{machine.name}
					</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<label for="filter-dripper">Dripper</label>
			<select
				id="filter-dripper"
				onchange={(e) => {
					const val = (e.target as HTMLSelectElement).value;
					window.location.href = buildUrl('dripper', val || null);
				}}
			>
				<option value="">All drippers</option>
				{#each drippers as dripper}
					<option value={dripper.id} selected={data.activeFilters.dripperId === dripper.id}>
						{dripper.name}
					</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<label for="filter-grinder">Grinder</label>
			<select
				id="filter-grinder"
				onchange={(e) => {
					const val = (e.target as HTMLSelectElement).value;
					window.location.href = buildUrl('grinder', val || null);
				}}
			>
				<option value="">All grinders</option>
				{#each grinders as grinder}
					<option value={grinder.id} selected={data.activeFilters.grinderId === grinder.id}>
						{grinder.name}
					</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<label for="filter-roaster">Roaster</label>
			<select
				id="filter-roaster"
				onchange={(e) => {
					const val = (e.target as HTMLSelectElement).value;
					window.location.href = buildUrl('roaster', val || null);
				}}
			>
				<option value="">All roasters</option>
				{#each data.filters.roasters as roaster}
					<option value={roaster} selected={data.activeFilters.roaster === roaster}>
						{roaster}
					</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<label for="filter-origin">Origin</label>
			<select
				id="filter-origin"
				onchange={(e) => {
					const val = (e.target as HTMLSelectElement).value;
					window.location.href = buildUrl('origin', val || null);
				}}
			>
				<option value="">All origins</option>
				{#each data.filters.origins as origin}
					<option value={origin} selected={data.activeFilters.origin === origin}>
						{origin}
					</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<label for="filter-country">Roaster Country</label>
			<select
				id="filter-country"
				onchange={(e) => {
					const val = (e.target as HTMLSelectElement).value;
					window.location.href = buildUrl('country', val || null);
				}}
			>
				<option value="">All countries</option>
				{#each data.filters.countries as country}
					<option value={country} selected={data.activeFilters.country === country}>
						{country}
					</option>
				{/each}
			</select>
		</div>
	</div>

	{#if hasFilters}
		<div class="filter-actions">
			<a href="/browse" class="btn btn-secondary">Clear filters</a>
			<span class="result-count">{data.beans.length} result{data.beans.length !== 1 ? 's' : ''}</span>
		</div>
	{/if}
	</details>

	<div class="bean-grid">
		{#each data.beans as bean}
			<BeanCard {bean} />
		{:else}
			<p class="empty">No beans match your filters. Try removing some filters or <a href="/beans/new">add a new bean</a>.</p>
		{/each}
	</div>
</div>

<style>
	h1 {
		margin-bottom: 1.5rem;
	}

	.filter-details {
		margin-bottom: 1rem;
	}

	.filter-accordion {
		display: none;
		cursor: pointer;
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--color-primary);
		padding: 0.5rem 0;
		list-style: none;
		align-items: center;
		gap: 0.5rem;
	}

	.filter-accordion::-webkit-details-marker {
		display: none;
	}

	.filter-accordion::before {
		content: '▸';
		display: inline-block;
		transition: transform 0.15s ease;
	}

	.filter-details[open] > .filter-accordion::before {
		transform: rotate(90deg);
	}

	.filter-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.35rem;
		border-radius: 999px;
		background: var(--color-primary);
		color: white;
		font-size: 0.72rem;
		font-weight: 700;
	}

	@media (max-width: 768px) {
		.filter-accordion {
			display: flex;
		}

		.filters {
			display: none;
		}

		.filter-details[open] .filters {
			display: grid;
		}
	}

	.filters {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.filter-group label {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-text-muted);
	}

	.filter-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.result-count {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.bean-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.empty {
		grid-column: 1 / -1;
		text-align: center;
		color: var(--color-text-muted);
		padding: 3rem;
	}
</style>
