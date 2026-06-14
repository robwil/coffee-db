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
		<div class="brew-recipe">
			<span class="recipe-dose">
				{brew.dose_grams}g
				{#if type === 'espresso'}
					<span class="recipe-arrow">&rarr;</span> {brew.yield_grams}g
				{:else if brew.water_grams}
					<span class="recipe-arrow">&rarr;</span> {brew.water_grams}g
				{/if}
			</span>
			{#if ratio}
				<span class="recipe-ratio">{ratio}</span>
			{/if}
			{#if brew.total_time_seconds}
				<span class="recipe-time">{formatTime(brew.total_time_seconds)}</span>
			{/if}
		</div>
	</div>

	<span class="meta-chip">
		{#if brew.rating}
			<span class="rating-row">
				<span class="rating-dots">
					{#each Array(10) as _, i}
						<span class="dot" class:filled={i < brew.rating}></span>
					{/each}
				</span>
				<span class="rating-number">{brew.rating}/10</span>
			</span>
			<hr class="chip-divider" />
		{/if}
		<span class="author-name">by {brew.submitted_by ?? 'Anonymous'}</span>
	</span>

	<div class="brew-pills">
		{#if type === 'espresso' && brew.machine_name}
			<span class="pill">☕ {brew.machine_manufacturer ? `${brew.machine_manufacturer} ${brew.machine_name}` : brew.machine_name}</span>
		{/if}
		{#if type === 'pourover' && brew.dripper_name}
			<span class="pill">☕ {brew.dripper_manufacturer ? `${brew.dripper_manufacturer} ${brew.dripper_name}` : brew.dripper_name}</span>
		{/if}
		{#if brew.grinder_name}
			<span class="pill">⚙ {brew.grinder_manufacturer ? `${brew.grinder_manufacturer} ${brew.grinder_name}` : brew.grinder_name}{brew.grind_setting ? ` @ ${brew.grind_setting}` : ''}</span>
		{/if}
		{#if brew.preinfusion_time_seconds && type === 'espresso'}
			<span class="pill">💧 Pre-infusion {formatTime(brew.preinfusion_time_seconds)}</span>
		{/if}
	</div>

	{#if brew.tasting_notes}
		<div class="brew-notes-row">
			{#each brew.tasting_notes.split(',').map((n: string) => n.trim()).filter(Boolean) as note}
				<span class="note-pill">{note}</span>
			{/each}
		</div>
	{/if}

</div>

<style>
	.brew-card {
		transition: none;
		position: relative;
		overflow: hidden;
	}

	.brew-card:hover {
		transform: none;
	}

	.brew-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.brew-recipe {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.75rem;
	}

	.recipe-dose {
		font-weight: 600;
		font-size: 1.1rem;
	}

	.recipe-arrow {
		color: var(--color-text-muted);
		font-weight: 400;
	}

	.recipe-ratio {
		color: var(--color-accent);
		font-weight: 600;
		font-size: 0.95rem;
	}

	.recipe-time {
		color: var(--color-text-muted);
		font-size: 0.95rem;
	}

	.meta-chip {
		position: absolute;
		top: -1px;
		right: -1px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.15rem;
		padding: 0.35rem 0.6rem;
		background: var(--color-border-light);
		border-bottom: 1px solid var(--color-border);
		border-left: 1px solid var(--color-border);
		border-radius: 0 var(--radius-lg) 0 var(--radius);
	}

	.rating-row {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.rating-dots {
		display: inline-flex;
		align-items: center;
		gap: 2px;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-border);
	}

	.dot.filled {
		background: var(--color-rating);
	}

	.rating-number {
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--color-rating);
	}

	.chip-divider {
		width: 100%;
		border: none;
		border-top: 1px solid var(--color-border);
		margin: 0;
	}

	.author-name {
		font-size: 0.68rem;
		color: var(--color-text-muted);
	}

	.brew-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.75rem;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.25rem 0.65rem;
		border-radius: 999px;
		font-size: 0.8rem;
		background: var(--color-border-light);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.brew-notes-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-top: 0.5rem;
	}

	.note-pill {
		display: inline-block;
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		font-size: 0.78rem;
		font-style: italic;
		background: rgba(201, 123, 58, 0.1);
		color: var(--color-accent);
		border: 1px solid rgba(201, 123, 58, 0.2);
	}

</style>
