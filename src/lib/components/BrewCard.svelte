<script lang="ts">
	let { brew, type }: { brew: any; type: 'espresso' | 'pourover' } = $props();

	const ratio = $derived(
		type === 'espresso'
			? brew.dose_grams && brew.yield_grams
				? `1:${(brew.yield_grams / brew.dose_grams).toFixed(1)}`
				: null
			: brew.dose_grams && brew.water_grams
				? `1:${(brew.water_grams / brew.dose_grams).toFixed(1)}`
				: null
	);

	function formatTime(seconds: number | null): string {
		if (!seconds) return '';
		const m = Math.floor(seconds / 60);
		const s = Math.round(seconds % 60);
		return m > 0 ? `${m}m ${s}s` : `${s}s`;
	}
</script>

<div class="card brew-card">
	<div class="brew-header">
		<div class="brew-params">
			<span class="param-primary">
				{brew.dose_grams}g
				{#if type === 'espresso'}
					&rarr; {brew.yield_grams}g
				{:else if brew.water_grams}
					/ {brew.water_grams}g water
				{/if}
			</span>
			{#if ratio}
				<span class="param-ratio">{ratio}</span>
			{/if}
			{#if brew.total_time_seconds}
				<span class="param-time">{formatTime(brew.total_time_seconds)}</span>
			{/if}
		</div>
		{#if brew.rating}
			<span class="rating-badge">{brew.rating}/10</span>
		{/if}
	</div>

	<div class="brew-equipment">
		{#if type === 'espresso' && brew.machine_name}
			<span class="equip">{brew.machine_name}</span>
		{/if}
		{#if type === 'pourover' && brew.dripper_name}
			<span class="equip">{brew.dripper_name}</span>
		{/if}
		{#if brew.grinder_name}
			<span class="equip">{brew.grinder_name}{brew.grind_setting ? ` @ ${brew.grind_setting}` : ''}</span>
		{/if}
	</div>

	{#if brew.preinfusion_time_seconds && type === 'espresso'}
		<p class="brew-detail">Pre-infusion: {formatTime(brew.preinfusion_time_seconds)}</p>
	{/if}

	{#if brew.tasting_notes}
		<p class="brew-notes">{brew.tasting_notes}</p>
	{/if}

	{#if brew.submitted_by}
		<p class="brew-author">by {brew.submitted_by}</p>
	{/if}
</div>

<style>
	.brew-card {
		transition: none;
	}

	.brew-card:hover {
		transform: none;
	}

	.brew-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.brew-params {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
	}

	.param-primary {
		font-weight: 600;
		font-size: 1.05rem;
	}

	.param-ratio {
		color: var(--color-accent);
		font-weight: 500;
	}

	.param-time {
		color: var(--color-text-muted);
	}

	.brew-equipment {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.equip {
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}

	.equip + .equip::before {
		content: ' / ';
	}

	.brew-detail {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		margin-top: 0.35rem;
	}

	.brew-notes {
		margin-top: 0.5rem;
		font-style: italic;
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}

	.brew-author {
		margin-top: 0.35rem;
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}
</style>
