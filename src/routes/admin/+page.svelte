<script lang="ts">
	import { enhance } from '$app/forms';
	import { format } from 'timeago.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeTab = $state<'beans' | 'espresso' | 'pourover'>('beans');

	function confirmDelete({ cancel }: { cancel: () => void }) {
		if (!confirm('Delete this? This cannot be undone.')) {
			cancel();
		}
	}

	function confirmDeleteBean({ cancel }: { cancel: () => void }) {
		if (!confirm('Delete this bean and ALL its brews? This cannot be undone.')) {
			cancel();
		}
	}
</script>

<div class="container">
	<h1>Admin</h1>

	<div class="tab-bar">
		<button
			class="tab"
			class:active={activeTab === 'beans'}
			onclick={() => (activeTab = 'beans')}
		>
			Beans ({data.beans.length})
		</button>
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

	{#if activeTab === 'beans'}
		<div class="brew-table">
			{#each data.beans as bean (bean.id)}
				<div class="brew-row card">
					<div class="brew-info">
						<div class="brew-primary">
							<strong>{bean.name}</strong>
							{#if bean.roaster}
								<span class="muted">by {bean.roaster}</span>
							{/if}
						</div>
						<div class="brew-details">
							{#if bean.origin}
								<span class="tag">{bean.origin}</span>
							{/if}
							{#if bean.roaster_country}
								<span class="muted">{bean.roaster_country}</span>
							{/if}
							<span class="muted">{bean.espresso_count} espresso / {bean.pourover_count} pourover</span>
						</div>
						<div class="brew-meta">
							<span class="muted">{format(String(bean.created_at))}</span>
							{#if bean.submitted_by}
								<span class="muted">by {bean.submitted_by}</span>
							{/if}
						</div>
					</div>
					<div class="brew-actions">
						<a href="/admin/beans/{bean.id}/edit" class="btn btn-secondary btn-sm">Edit</a>
						<form method="POST" action="?/deleteBean" use:enhance={confirmDeleteBean}>
							<input type="hidden" name="id" value={bean.id} />
							<button type="submit" class="btn btn-danger btn-sm">Delete</button>
						</form>
					</div>
				</div>
			{:else}
				<p class="empty">No beans yet.</p>
			{/each}
		</div>
	{:else if activeTab === 'espresso'}
		<div class="brew-table">
			{#each data.espressoBrews as brew (brew.id)}
				<div class="brew-row card">
					<div class="brew-info">
						<div class="brew-primary">
							<strong>{brew.bean_name}</strong>
							{#if brew.bean_roaster}
								<span class="muted">by {brew.bean_roaster}</span>
							{/if}
						</div>
						<div class="brew-details">
							<span>{brew.dose_grams}g in / {brew.yield_grams}g out</span>
							{#if brew.total_time_seconds}
								<span>{brew.total_time_seconds}s</span>
							{/if}
							{#if brew.rating}
								<span class="rating-badge">{brew.rating}/10</span>
							{/if}
							{#if brew.machine_name}
								<span class="muted">{brew.machine_name}</span>
							{/if}
						</div>
						<div class="brew-meta">
							<span class="muted">{format(String(brew.created_at))}</span>
							{#if brew.submitted_by}
								<span class="muted">by {brew.submitted_by}</span>
							{/if}
						</div>
					</div>
					<div class="brew-actions">
						<a href="/admin/espresso/{brew.id}/edit" class="btn btn-secondary btn-sm">Edit</a>
						<form method="POST" action="?/deleteEspresso" use:enhance={confirmDelete}>
							<input type="hidden" name="id" value={brew.id} />
							<button type="submit" class="btn btn-danger btn-sm">Delete</button>
						</form>
					</div>
				</div>
			{:else}
				<p class="empty">No espresso brews yet.</p>
			{/each}
		</div>
	{:else}
		<div class="brew-table">
			{#each data.pouroverBrews as brew (brew.id)}
				<div class="brew-row card">
					<div class="brew-info">
						<div class="brew-primary">
							<strong>{brew.bean_name}</strong>
							{#if brew.bean_roaster}
								<span class="muted">by {brew.bean_roaster}</span>
							{/if}
						</div>
						<div class="brew-details">
							<span>{brew.dose_grams}g coffee</span>
							{#if brew.water_grams}
								<span>/ {brew.water_grams}g water</span>
							{/if}
							{#if brew.total_time_seconds}
								<span>{brew.total_time_seconds}s</span>
							{/if}
							{#if brew.rating}
								<span class="rating-badge">{brew.rating}/10</span>
							{/if}
							{#if brew.dripper_name}
								<span class="muted">{brew.dripper_name}</span>
							{/if}
						</div>
						<div class="brew-meta">
							<span class="muted">{format(String(brew.created_at))}</span>
							{#if brew.submitted_by}
								<span class="muted">by {brew.submitted_by}</span>
							{/if}
						</div>
					</div>
					<div class="brew-actions">
						<a href="/admin/pourover/{brew.id}/edit" class="btn btn-secondary btn-sm">Edit</a>
						<form method="POST" action="?/deletePourover" use:enhance={confirmDelete}>
							<input type="hidden" name="id" value={brew.id} />
							<button type="submit" class="btn btn-danger btn-sm">Delete</button>
						</form>
					</div>
				</div>
			{:else}
				<p class="empty">No pourover brews yet.</p>
			{/each}
		</div>
	{/if}
</div>

<style>
	h1 {
		margin-bottom: 1.5rem;
	}

	.tab-bar {
		display: flex;
		gap: 0;
		border-bottom: 2px solid var(--color-border-light);
		margin-bottom: 1.5rem;
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

	.brew-table {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.brew-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.brew-info {
		flex: 1;
		min-width: 0;
	}

	.brew-primary {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.brew-details {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 0.25rem;
		font-size: 0.9rem;
	}

	.brew-meta {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.25rem;
		font-size: 0.8rem;
	}

	.brew-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-shrink: 0;
	}

	.btn-sm {
		padding: 0.35rem 0.75rem;
		font-size: 0.85rem;
	}

	.btn-danger {
		background: #dc3545;
		color: white;
		border: none;
	}

	.btn-danger:hover {
		background: #c82333;
	}

	.muted {
		color: var(--color-text-muted);
	}

	.empty {
		text-align: center;
		color: var(--color-text-muted);
		padding: 2rem;
	}
</style>
