<script lang="ts">
	const STORAGE_KEY = 'coffee-db-always-show-advanced';

	let alwaysShow = $state(false);
	let manualToggle = $state(false);

	if (typeof localStorage !== 'undefined') {
		alwaysShow = localStorage.getItem(STORAGE_KEY) === 'true';
	}

	const showAdvanced = $derived(alwaysShow || manualToggle);

	function toggle() {
		manualToggle = !manualToggle;
	}

	function toggleAlwaysShow() {
		alwaysShow = !alwaysShow;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, String(alwaysShow));
		}
		if (alwaysShow) {
			manualToggle = false;
		}
	}

	let { children, startOpen = false }: { children: any; startOpen?: boolean } = $props();

	// svelte-ignore state_referenced_locally
	if (startOpen) {
		manualToggle = true;
	}
</script>

<div class="advanced-toggle-row">
	{#if !alwaysShow}
		<button type="button" class="btn btn-secondary toggle-btn" onclick={toggle}>
			{showAdvanced ? 'Hide' : 'Show'} advanced fields
		</button>
	{/if}
	{#if showAdvanced}
		<label class="always-show-label">
			<input type="checkbox" checked={alwaysShow} onchange={toggleAlwaysShow} />
			Always show advanced fields
		</label>
	{/if}
</div>

{#if showAdvanced}
	{@render children()}
{/if}

<style>
	.advanced-toggle-row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.always-show-label {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--color-text-muted);
		cursor: pointer;
		user-select: none;
	}

	.always-show-label input[type='checkbox'] {
		width: auto;
		margin: 0;
	}
</style>
