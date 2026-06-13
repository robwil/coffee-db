<script lang="ts">
	import type { PageData } from './$types';
	import BeanCard from '$lib/components/BeanCard.svelte';

	let { data }: { data: PageData } = $props();

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
</script>

<div class="container">
	<h1>Browse Beans</h1>

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
				{#each data.filters.machines as machine}
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
				{#each data.filters.drippers as dripper}
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
				{#each data.filters.grinders as grinder}
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
