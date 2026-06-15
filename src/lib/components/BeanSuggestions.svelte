<script lang="ts">
	let { query = '' }: { query: string } = $props();

	let results = $state<any[]>([]);
	let loading = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		clearTimeout(searchTimeout);
		if (!query.trim() || query.trim().length < 2) {
			results = [];
			return;
		}
		loading = true;
		searchTimeout = setTimeout(async () => {
			const res = await fetch(`/api/beans/search?q=${encodeURIComponent(query)}`);
			results = await res.json();
			loading = false;
		}, 300);
	});
</script>

{#if loading}
	<p class="suggestions-hint">Searching for similar beans...</p>
{:else if results.length > 0}
	<div class="suggestions">
		<p class="suggestions-hint">Did you mean one of these?</p>
		{#each results as bean}
			<a href="/beans/{bean.id}" class="suggestion">
				<strong>{bean.name}</strong>
				{#if bean.roaster}
					<span class="muted">by {bean.roaster}</span>
				{/if}
				{#if bean.origin}
					<span class="tag">{bean.origin}</span>
				{/if}
			</a>
		{/each}
	</div>
{/if}

<style>
	.suggestions {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		overflow: hidden;
		margin-top: 0.25rem;
	}

	.suggestions-hint {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		padding: 0.5rem 0.75rem;
		margin: 0;
	}

	.suggestion {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		color: var(--color-text);
		text-decoration: none;
		border-top: 1px solid var(--color-border-light);
	}

	.suggestion:hover {
		background: var(--color-border-light);
		text-decoration: none;
	}

	.muted {
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}
</style>
