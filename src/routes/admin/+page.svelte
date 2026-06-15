<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { format } from 'timeago.js';
	import BrewCard from '$lib/components/BrewCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Tab = 'beans' | 'espresso' | 'pourover';
	const validTabs: Tab[] = ['beans', 'espresso', 'pourover'];

	const activeTab = $derived(
		validTabs.includes(page.url.searchParams.get('tab') as Tab)
			? page.url.searchParams.get('tab') as Tab
			: 'beans'
	);

	function setTab(tab: Tab) {
		goto(`?tab=${tab}`, { replaceState: false, noScroll: true });
	}

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

	type BrewRow = Record<string, unknown> & { id: string; bean_id: string; bean_name: string; bean_roaster: string | null };

	function groupByBean(brews: BrewRow[]): { beanId: string; beanName: string; beanRoaster: string | null; brews: BrewRow[] }[] {
		const groups = new Map<string, { beanId: string; beanName: string; beanRoaster: string | null; brews: BrewRow[] }>();
		for (const brew of brews) {
			const key = String(brew.bean_id);
			if (!groups.has(key)) {
				groups.set(key, { beanId: key, beanName: String(brew.bean_name), beanRoaster: brew.bean_roaster ? String(brew.bean_roaster) : null, brews: [] });
			}
			groups.get(key)!.brews.push(brew);
		}
		return [...groups.values()];
	}

	const espressoGroups = $derived(groupByBean(data.espressoBrews as unknown as BrewRow[]));
	const pouroverGroups = $derived(groupByBean(data.pouroverBrews as unknown as BrewRow[]));
</script>

<div class="container">
	<h1>Admin</h1>

	<div class="tab-bar">
		<button
			class="tab"
			class:active={activeTab === 'beans'}
			onclick={() => setTab('beans')}
		>
			Beans ({data.beans.length})
		</button>
		<button
			class="tab"
			class:active={activeTab === 'espresso'}
			onclick={() => setTab('espresso')}
		>
			Espresso ({data.espressoBrews.length})
		</button>
		<button
			class="tab"
			class:active={activeTab === 'pourover'}
			onclick={() => setTab('pourover')}
		>
			Pourover ({data.pouroverBrews.length})
		</button>
	</div>

	{#if activeTab === 'beans'}
		<div class="item-list">
			{#each data.beans as bean (bean.id)}
				<div class="bean-with-actions">
					<div class="bean-card card">
						<div class="bean-info">
							<div class="bean-primary">
								<strong>{bean.name}</strong>
								{#if bean.roaster}
									<span class="muted">by {bean.roaster}</span>
								{/if}
							</div>
							<div class="bean-details">
								{#if bean.origin}
									<span class="tag">{bean.origin}</span>
								{/if}
								{#if bean.roaster_country}
									<span class="muted">{bean.roaster_country}</span>
								{/if}
								<span class="muted">{bean.espresso_count} espresso / {bean.pourover_count} pourover</span>
							</div>
							<div class="bean-meta">
								<span class="muted">{format(String(bean.created_at))}</span>
								{#if bean.submitted_by}
									<span class="muted">by {bean.submitted_by}</span>
								{/if}
							</div>
						</div>
					</div>
					<div class="card-actions">
						<a href="/admin/beans/{bean.id}/edit" class="action-btn" title="Edit">✏️</a>
						<form method="POST" action="?/deleteBean" use:enhance={confirmDeleteBean}>
							<input type="hidden" name="id" value={bean.id} />
							<button type="submit" class="action-btn danger" title="Delete">🗑️</button>
						</form>
					</div>
				</div>
			{:else}
				<p class="empty">No beans yet.</p>
			{/each}
		</div>
	{:else if activeTab === 'espresso'}
		<div class="item-list">
			{#each espressoGroups as group (group.beanId)}
				<div class="bean-group">
					<h2 class="bean-group-header">
						<a href="/beans/{group.beanId}">{group.beanName}</a>
						{#if group.beanRoaster}
							<span class="muted">by {group.beanRoaster}</span>
						{/if}
					</h2>
					<div class="brew-list">
						{#each group.brews as brew (brew.id)}
							<div class="brew-with-actions">
								<BrewCard {brew} type="espresso" />
								<div class="card-actions">
									<a href="/admin/espresso/{brew.id}/edit" class="action-btn" title="Edit">✏️</a>
									<form method="POST" action="?/deleteEspresso" use:enhance={confirmDelete}>
										<input type="hidden" name="id" value={brew.id} />
										<button type="submit" class="action-btn danger" title="Delete">🗑️</button>
									</form>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<p class="empty">No espresso brews yet.</p>
			{/each}
		</div>
	{:else}
		<div class="item-list">
			{#each pouroverGroups as group (group.beanId)}
				<div class="bean-group">
					<h2 class="bean-group-header">
						<a href="/beans/{group.beanId}">{group.beanName}</a>
						{#if group.beanRoaster}
							<span class="muted">by {group.beanRoaster}</span>
						{/if}
					</h2>
					<div class="brew-list">
						{#each group.brews as brew (brew.id)}
							<div class="brew-with-actions">
								<BrewCard {brew} type="pourover" />
								<div class="card-actions">
									<a href="/admin/pourover/{brew.id}/edit" class="action-btn" title="Edit">✏️</a>
									<form method="POST" action="?/deletePourover" use:enhance={confirmDelete}>
										<input type="hidden" name="id" value={brew.id} />
										<button type="submit" class="action-btn danger" title="Delete">🗑️</button>
									</form>
								</div>
							</div>
						{/each}
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

	.item-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Bean groups for brew tabs */
	.bean-group-header {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		padding-bottom: 0.35rem;
		border-bottom: 1px solid var(--color-border-light);
	}

	.bean-group-header a {
		color: var(--color-text);
	}

	.bean-group-header a:hover {
		color: var(--color-primary);
	}

	.brew-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Action strip attached to bottom of card */
	.brew-with-actions,
	.bean-card {
		position: relative;
	}

	.card-actions {
		display: flex;
		gap: 0;
	}

	.card-actions form {
		display: flex;
	}

	.brew-with-actions :global(.brew-card),
	.bean-with-actions .bean-card {
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
		margin-bottom: 0;
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8rem;
		background: var(--color-border-light);
		border: 1px solid var(--color-border);
		border-top: none;
		padding: 0.3rem 0.6rem;
		cursor: pointer;
		text-decoration: none;
		color: var(--color-text-muted);
		line-height: 1;
		transition: background 0.15s;
	}

	.action-btn:first-child {
		border-radius: 0 0 0 var(--radius);
	}

	.action-btn:last-child {
		border-radius: 0 0 var(--radius) 0;
		border-left: none;
	}

	.action-btn:hover {
		background: var(--color-border);
		text-decoration: none;
	}

	.action-btn.danger:hover {
		background: #fde8e8;
	}

	/* Bean cards in beans tab */
	.bean-info {
		flex: 1;
		min-width: 0;
	}

	.bean-primary {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.bean-details {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 0.25rem;
		font-size: 0.9rem;
	}

	.bean-meta {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.25rem;
		font-size: 0.8rem;
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
