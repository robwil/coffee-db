<script lang="ts">
	import type { PageData } from './$types';
	import { ROAST_LEVELS } from '$lib/types';
	import BrewCard from '$lib/components/BrewCard.svelte';

	let { data }: { data: PageData } = $props();

	let activeTab = $state<'espresso' | 'pourover'>('espresso');

	const roastLabel = $derived(
		ROAST_LEVELS.find((r) => r.value === data.bean.roast_level)?.label ?? null
	);
</script>

<div class="container">
	<div class="bean-detail card">
		<div class="bean-header">
			<div>
				<h1>{data.bean.name}</h1>
				{#if data.bean.roaster}
					<p class="roaster">
						by {data.bean.roaster}
						{#if data.bean.roaster_city}, {data.bean.roaster_city}{/if}
						{#if data.bean.roaster_country} ({data.bean.roaster_country}){/if}
					</p>
				{/if}
			</div>
		</div>

		<div class="bean-tags">
			{#if data.bean.origin}
				<span class="tag">{data.bean.origin}</span>
			{/if}
			{#if roastLabel}
				<span class="tag">{roastLabel}</span>
			{/if}
			{#if data.bean.caffeine && data.bean.caffeine !== 'full'}
				<span class="tag">{data.bean.caffeine}</span>
			{/if}
		</div>

		{#if data.bean.tasting_notes}
			<p class="tasting-notes">{data.bean.tasting_notes}</p>
		{/if}

		{#if data.bean.price && data.bean.weight_grams}
			<p class="price">
				{data.bean.currency ?? ''}{data.bean.price} / {data.bean.weight_grams}g
			</p>
		{/if}
	</div>

	<section class="brews-section">
		<div class="tab-bar">
			<button
				class="tab"
				class:active={activeTab === 'espresso'}
				onclick={() => (activeTab = 'espresso')}
			>
				Espresso ({data.espressoBrews.length})
			</button>
			<button
				class="tab"
				class:active={activeTab === 'pourover'}
				onclick={() => (activeTab = 'pourover')}
			>
				Pourover ({data.pouroverBrews.length})
			</button>
		</div>

		<div class="brew-actions">
			{#if activeTab === 'espresso'}
				<a href="/beans/{data.bean.id}/espresso/new" class="btn btn-primary">
					+ Add Espresso Recipe
				</a>
			{:else}
				<a href="/beans/{data.bean.id}/pourover/new" class="btn btn-primary">
					+ Add Pourover Recipe
				</a>
			{/if}
		</div>

		<div class="brew-list">
			{#if activeTab === 'espresso'}
				{#each data.espressoBrews as brew}
					<BrewCard {brew} type="espresso" />
				{:else}
					<p class="empty">No espresso recipes yet. Be the first to add one!</p>
				{/each}
			{:else}
				{#each data.pouroverBrews as brew}
					<BrewCard {brew} type="pourover" />
				{:else}
					<p class="empty">No pourover recipes yet. Be the first to add one!</p>
				{/each}
			{/if}
		</div>
	</section>
</div>

<style>
	.bean-detail {
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 1.75rem;
		margin-bottom: 0.25rem;
	}

	.roaster {
		color: var(--color-text-muted);
		font-size: 1.05rem;
	}

	.bean-tags {
		display: flex;
		gap: 0.35rem;
		margin-top: 0.75rem;
	}

	.tasting-notes {
		margin-top: 0.75rem;
		font-style: italic;
		color: var(--color-text-muted);
	}

	.price {
		margin-top: 0.5rem;
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}

	.tab-bar {
		display: flex;
		gap: 0;
		border-bottom: 2px solid var(--color-border-light);
		margin-bottom: 1rem;
	}

	.tab {
		padding: 0.6rem 1.25rem;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		margin-bottom: -2px;
		color: var(--color-text-muted);
		font-weight: 500;
		font-size: 0.95rem;
	}

	.tab.active {
		color: var(--color-primary);
		border-bottom-color: var(--color-primary);
	}

	.brew-actions {
		margin-bottom: 1rem;
	}

	.brew-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.empty {
		text-align: center;
		color: var(--color-text-muted);
		padding: 2rem;
	}
</style>
