<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { format } from 'timeago.js';
	import BrewCard from '$lib/components/BrewCard.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type Tab = 'beans' | 'espresso' | 'pourover' | 'machines' | 'grinders' | 'drippers';
	const validTabs: Tab[] = ['beans', 'espresso', 'pourover', 'machines', 'grinders', 'drippers'];

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

	function confirmPurge(type: string) {
		return ({ cancel }: { cancel: () => void }) => {
			if (!confirm(`Delete all unused ${type}? This cannot be undone.`)) {
				cancel();
			}
		};
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

	type EquipmentRow = Record<string, unknown> & { id: string; name: string; manufacturer: string | null; created_at: string };

	function unusedCount(items: EquipmentRow[], countFields: string[]): number {
		return items.filter(item => countFields.every(f => Number(item[f]) === 0)).length;
	}
</script>

<div class="container">
	<h1>Admin</h1>

	{#if form?.purged}
		<div class="flash">
			Purged {form.count} unused {form.purged}.
		</div>
	{/if}

	{#if form?.error}
		<div class="flash flash-error">
			{form.error}
		</div>
	{/if}

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
		<button
			class="tab"
			class:active={activeTab === 'machines'}
			onclick={() => setTab('machines')}
		>
			Machines ({data.machines.length})
		</button>
		<button
			class="tab"
			class:active={activeTab === 'grinders'}
			onclick={() => setTab('grinders')}
		>
			Grinders ({data.grinders.length})
		</button>
		<button
			class="tab"
			class:active={activeTab === 'drippers'}
			onclick={() => setTab('drippers')}
		>
			Drippers ({data.drippers.length})
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
	{:else if activeTab === 'pourover'}
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
	{:else if activeTab === 'machines'}
		{@const items = data.machines as unknown as EquipmentRow[]}
		{@const numUnused = unusedCount(items, ['brew_count'])}
		<div class="equipment-header">
			{#if numUnused > 0}
				<form method="POST" action="?/findUnusedMachines" use:enhance={confirmPurge('machines')}>
					<button type="submit" class="btn btn-secondary btn-sm">Purge {numUnused} unused</button>
				</form>
			{/if}
		</div>
		<div class="item-list">
			{#each items as machine (machine.id)}
				<div class="equipment-with-actions">
					<div class="equipment-card card" class:unused={Number(machine.brew_count) === 0}>
						<div class="equipment-info">
							<div class="equipment-primary">
								<strong>{machine.name}</strong>
								{#if machine.manufacturer}
									<span class="muted">by {machine.manufacturer}</span>
								{/if}
							</div>
							<div class="equipment-details">
								<span class="muted">{machine.brew_count} brew{Number(machine.brew_count) !== 1 ? 's' : ''}</span>
								<span class="muted">{format(String(machine.created_at))}</span>
							</div>
						</div>
					</div>
					<div class="card-actions">
						<a href="/admin/machines/{machine.id}/edit" class="action-btn" title="Edit">✏️</a>
						<form method="POST" action="?/deleteMachine" use:enhance={confirmDelete}>
							<input type="hidden" name="id" value={machine.id} />
							<button type="submit" class="action-btn danger" title="Delete">🗑️</button>
						</form>
					</div>
				</div>
			{:else}
				<p class="empty">No machines yet.</p>
			{/each}
		</div>
	{:else if activeTab === 'grinders'}
		{@const items = data.grinders as unknown as (EquipmentRow & { espresso_count: number; pourover_count: number })[]}
		{@const numUnused = unusedCount(items, ['espresso_count', 'pourover_count'])}
		<div class="equipment-header">
			{#if numUnused > 0}
				<form method="POST" action="?/findUnusedGrinders" use:enhance={confirmPurge('grinders')}>
					<button type="submit" class="btn btn-secondary btn-sm">Purge {numUnused} unused</button>
				</form>
			{/if}
		</div>
		<div class="item-list">
			{#each items as grinder (grinder.id)}
				{@const totalBrews = Number(grinder.espresso_count) + Number(grinder.pourover_count)}
				<div class="equipment-with-actions">
					<div class="equipment-card card" class:unused={totalBrews === 0}>
						<div class="equipment-info">
							<div class="equipment-primary">
								<strong>{grinder.name}</strong>
								{#if grinder.manufacturer}
									<span class="muted">by {grinder.manufacturer}</span>
								{/if}
							</div>
							<div class="equipment-details">
								<span class="muted">{grinder.espresso_count} espresso / {grinder.pourover_count} pourover</span>
								<span class="muted">{format(String(grinder.created_at))}</span>
							</div>
						</div>
					</div>
					<div class="card-actions">
						<a href="/admin/grinders/{grinder.id}/edit" class="action-btn" title="Edit">✏️</a>
						<form method="POST" action="?/deleteGrinder" use:enhance={confirmDelete}>
							<input type="hidden" name="id" value={grinder.id} />
							<button type="submit" class="action-btn danger" title="Delete">🗑️</button>
						</form>
					</div>
				</div>
			{:else}
				<p class="empty">No grinders yet.</p>
			{/each}
		</div>
	{:else if activeTab === 'drippers'}
		{@const items = data.drippers as unknown as EquipmentRow[]}
		{@const numUnused = unusedCount(items, ['brew_count'])}
		<div class="equipment-header">
			{#if numUnused > 0}
				<form method="POST" action="?/findUnusedDrippers" use:enhance={confirmPurge('drippers')}>
					<button type="submit" class="btn btn-secondary btn-sm">Purge {numUnused} unused</button>
				</form>
			{/if}
		</div>
		<div class="item-list">
			{#each items as dripper (dripper.id)}
				<div class="equipment-with-actions">
					<div class="equipment-card card" class:unused={Number(dripper.brew_count) === 0}>
						<div class="equipment-info">
							<div class="equipment-primary">
								<strong>{dripper.name}</strong>
								{#if dripper.manufacturer}
									<span class="muted">by {dripper.manufacturer}</span>
								{/if}
							</div>
							<div class="equipment-details">
								<span class="muted">{dripper.brew_count} brew{Number(dripper.brew_count) !== 1 ? 's' : ''}</span>
								<span class="muted">{format(String(dripper.created_at))}</span>
							</div>
						</div>
					</div>
					<div class="card-actions">
						<a href="/admin/drippers/{dripper.id}/edit" class="action-btn" title="Edit">✏️</a>
						<form method="POST" action="?/deleteDripper" use:enhance={confirmDelete}>
							<input type="hidden" name="id" value={dripper.id} />
							<button type="submit" class="action-btn danger" title="Delete">🗑️</button>
						</form>
					</div>
				</div>
			{:else}
				<p class="empty">No drippers yet.</p>
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
		flex-wrap: wrap;
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
	.bean-card,
	.equipment-with-actions {
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
	.bean-with-actions .bean-card,
	.equipment-with-actions .equipment-card {
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

	/* Equipment cards */
	.equipment-header {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}

	.equipment-info {
		flex: 1;
		min-width: 0;
	}

	.equipment-primary {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.equipment-details {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 0.25rem;
		font-size: 0.9rem;
	}

	.equipment-card.unused {
		border-left: 3px solid var(--color-accent);
	}

	.btn-sm {
		padding: 0.35rem 0.75rem;
		font-size: 0.85rem;
	}

	.flash {
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		margin-bottom: 1rem;
		background: #e8f5e9;
		color: #2e7d32;
		font-size: 0.9rem;
	}

	.flash-error {
		background: #fde8e8;
		color: #c62828;
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
