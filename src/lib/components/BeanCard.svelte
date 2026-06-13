<script lang="ts">
	import { ROAST_LEVELS } from '$lib/types';

	let { bean }: { bean: any } = $props();

	const roastLabel = $derived(
		ROAST_LEVELS.find((r) => r.value === bean.roast_level)?.label ?? ''
	);
	const totalBrews = $derived((bean.espresso_count ?? 0) + (bean.pourover_count ?? 0));
</script>

<a href="/beans/{bean.id}" class="card bean-card">
	<div class="bean-header">
		<h3>{bean.name}</h3>
		{#if bean.avg_rating}
			<span class="rating-badge">{bean.avg_rating}/10</span>
		{/if}
	</div>
	{#if bean.roaster}
		<p class="roaster">{bean.roaster}</p>
	{/if}
	<div class="bean-meta">
		{#if bean.origin}
			<span class="tag">{bean.origin}</span>
		{/if}
		{#if roastLabel}
			<span class="tag">{roastLabel}</span>
		{/if}
		{#if totalBrews > 0}
			<span class="tag">{totalBrews} brew{totalBrews !== 1 ? 's' : ''}</span>
		{/if}
	</div>
</a>

<style>
	.bean-card {
		display: block;
		text-decoration: none;
		color: inherit;
		transition: transform 0.1s;
	}

	.bean-card:hover {
		transform: translateY(-2px);
		text-decoration: none;
	}

	.bean-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.5rem;
	}

	h3 {
		font-size: 1rem;
		margin: 0;
	}

	.roaster {
		color: var(--color-text-muted);
		font-size: 0.9rem;
		margin: 0.25rem 0;
	}

	.bean-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-top: 0.5rem;
	}
</style>
