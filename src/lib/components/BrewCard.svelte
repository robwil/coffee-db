<script lang="ts">
	import { format } from 'timeago.js';

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

	const timeAgo = $derived(brew.created_at ? format(brew.created_at) : null);
	const fullTimestamp = $derived(
		brew.created_at ? new Date(brew.created_at).toLocaleString() : null
	);

	const tastingNotes = $derived.by(() => {
		if (!brew.tasting_notes) return null;
		const text = brew.tasting_notes.trim();
		const parts = text.split(',').map((s: string) => s.trim()).filter(Boolean);
		const avgWords = parts.reduce((sum: number, p: string) => sum + p.split(/\s+/).length, 0) / parts.length;
		const isProse = avgWords > 3;
		return isProse ? { type: 'prose' as const, text } : { type: 'pills' as const, notes: parts };
	});

	const details = $derived.by(() => {
		const parts: string[] = [];
		if (brew.days_rested != null) parts.push(`${brew.days_rested}d rested`);
		if (brew.burr_set) parts.push(brew.burr_set);
		if (type === 'espresso') {
			if (brew.basket) parts.push(brew.basket);
			if (brew.pressure_profile) parts.push(brew.pressure_profile);
		}
		if (type === 'pourover') {
			if (brew.filter_type) parts.push(`${brew.filter_type} filter`);
			if (brew.kettle) parts.push(brew.kettle);
			if (brew.bloom_time_seconds || brew.bloom_water_grams) {
				const bloom = [
					brew.bloom_time_seconds ? formatTime(brew.bloom_time_seconds) : null,
					brew.bloom_water_grams ? `${brew.bloom_water_grams}g` : null
				].filter(Boolean).join(' / ');
				parts.push(`bloom ${bloom}`);
			}
			if (brew.pour_count) parts.push(`${brew.pour_count} pours`);
			if (brew.pour_technique) parts.push(brew.pour_technique);
		}
		if (brew.additional_notes) parts.push(brew.additional_notes);
		return parts.length ? parts : null;
	});

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
				<span class="recipe-time">🕐 {formatTime(brew.total_time_seconds)}{#if brew.preinfusion_time_seconds && type === 'espresso'}{' '}({formatTime(brew.preinfusion_time_seconds)} pre){/if}</span>
			{/if}
			{#if brew.water_temp_c}
				<span class="recipe-temp">🌡️ {brew.water_temp_c}°C</span>
			{/if}
		</div>
		<div class="brew-equipment">
			{#if type === 'espresso' && brew.machine_name}
				<span class="pill">☕ {brew.machine_manufacturer ? `${brew.machine_manufacturer} ${brew.machine_name}` : brew.machine_name}</span>
			{/if}
			{#if type === 'pourover' && brew.dripper_name}
				<span class="pill">☕ {brew.dripper_manufacturer ? `${brew.dripper_manufacturer} ${brew.dripper_name}` : brew.dripper_name}</span>
			{/if}
			{#if brew.grinder_name}
				<span class="pill">⚙ {brew.grinder_manufacturer ? `${brew.grinder_manufacturer} ${brew.grinder_name}` : brew.grinder_name}{brew.grind_setting ? ` @ ${brew.grind_setting}` : ''}</span>
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
		{/if}
		<span class="chip-bottom">
			<span class="author-name">by {brew.submitted_by ?? 'Anonymous'}</span>
			{#if timeAgo}
				<span class="time-ago" title={fullTimestamp}>{timeAgo}</span>
			{/if}
		</span>
	</span>

	{#if tastingNotes}
		{#if tastingNotes.type === 'pills'}
			<div class="brew-notes">
				{#each tastingNotes.notes as note}
					<span class="note-pill">{note}</span>
				{/each}
			</div>
		{:else}
			<p class="brew-notes-prose">{tastingNotes.text}</p>
		{/if}
	{/if}

	{#if details}
		<p class="brew-details">{details.join(' · ')}</p>
	{/if}

</div>

<style>
	.brew-card {
		transition: none;
		position: relative;
		overflow: hidden;
		padding-top: 0.7rem;
		padding-bottom: 0.7rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		min-height: 4.5rem;
	}

	.brew-card:hover {
		transform: none;
	}

	.brew-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-right: 8rem;
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

	.recipe-temp {
		color: var(--color-text-muted);
		font-size: 0.95rem;
	}

	.meta-chip {
		position: absolute;
		top: -1px;
		bottom: -1px;
		right: -1px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: space-between;
		padding: 0.45rem 0.6rem;
		background: var(--color-border-light);
		border-left: 1px solid var(--color-border);
		border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
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

	.chip-bottom {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.author-name {
		font-size: 0.68rem;
		color: var(--color-text-muted);
	}

	.time-ago {
		font-size: 0.62rem;
		color: var(--color-text-muted);
		opacity: 0.7;
		cursor: default;
	}

	.brew-equipment {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		justify-content: flex-end;
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

	.brew-notes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		padding-right: 8rem;
	}

	.brew-notes-prose {
		font-size: 0.85rem;
		font-style: italic;
		color: var(--color-accent);
		padding-right: 8rem;
	}

	.brew-details {
		font-size: 0.78rem;
		color: var(--color-text-muted);
		padding-right: 8rem;
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
