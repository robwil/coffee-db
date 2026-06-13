<script lang="ts">
	let {
		label,
		name,
		endpoint,
		placeholder = 'Search...'
	}: {
		label: string;
		name: string;
		endpoint: string;
		placeholder?: string;
	} = $props();

	let query = $state('');
	let results = $state<any[]>([]);
	let selectedId = $state('');
	let selectedName = $state('');
	let manufacturer = $state('');
	let showDropdown = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout>;

	const isNewEntry = $derived(!selectedId && query.trim().length > 0);

	function search() {
		clearTimeout(searchTimeout);
		selectedId = '';
		manufacturer = '';
		if (!query.trim()) {
			results = [];
			showDropdown = false;
			return;
		}
		searchTimeout = setTimeout(async () => {
			const res = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`);
			results = await res.json();
			showDropdown = true;
		}, 200);
	}

	function select(item: any) {
		selectedId = item.id;
		selectedName = item.name;
		query = item.name;
		manufacturer = '';
		showDropdown = false;
	}

	function handleBlur() {
		setTimeout(() => {
			showDropdown = false;
			if (!selectedId && query.trim()) {
				selectedName = query.trim();
			}
		}, 200);
	}
</script>

<div class="form-group autocomplete">
	<label for={name}>{label}</label>
	<input type="hidden" name="{name}_id" value={selectedId} />
	<input type="hidden" name="{name}_name" value={selectedName || query.trim()} />
	<input type="hidden" name="{name}_manufacturer" value={manufacturer} />
	<input
		type="text"
		id={name}
		bind:value={query}
		oninput={search}
		onblur={handleBlur}
		onfocus={() => results.length > 0 && (showDropdown = true)}
		{placeholder}
		autocomplete="off"
	/>
	{#if showDropdown && results.length > 0}
		<div class="dropdown">
			{#each results as item}
				<button type="button" class="dropdown-item" onclick={() => select(item)}>
					{item.name}
					{#if item.manufacturer}
						<span class="muted">({item.manufacturer})</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

{#if isNewEntry}
	<div class="form-group manufacturer-field">
		<label for="{name}_manufacturer_input">Manufacturer (optional)</label>
		<input
			type="text"
			id="{name}_manufacturer_input"
			bind:value={manufacturer}
			placeholder="e.g. Breville, La Marzocco, Niche..."
		/>
	</div>
{/if}

<style>
	.autocomplete {
		position: relative;
	}

	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		z-index: 20;
		max-height: 200px;
		overflow-y: auto;
	}

	.dropdown-item {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.5rem 0.75rem;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.dropdown-item:hover {
		background: var(--color-border-light);
	}

	.muted {
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}

	.manufacturer-field {
		margin-top: -0.5rem;
		padding-left: 1rem;
		border-left: 2px solid var(--color-border-light);
	}
</style>
