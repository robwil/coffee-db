<script lang="ts">
	import { enhance } from '$app/forms';
	import { ORIGINS, ROAST_LEVELS } from '$lib/types';
	import AdvancedToggle from '$lib/components/AdvancedToggle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const bean = data.bean as Record<string, unknown>;
</script>

<div class="container">
	<p class="breadcrumb">
		<a href="/admin">Admin</a> &rsaquo; Edit Bean
	</p>
	<h1>Edit Bean — {bean.name}</h1>

	<form method="POST" use:enhance class="brew-form">
		<div class="form-section">
			<h2>Core Info</h2>
			<div class="form-group">
				<label for="name">Bean Name *</label>
				<input type="text" id="name" name="name" required value={bean.name ?? ''} />
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="roaster">Roaster</label>
					<input type="text" id="roaster" name="roaster" value={bean.roaster ?? ''} />
				</div>
				<div class="form-group">
					<label for="origin">Origin</label>
					<select id="origin" name="origin">
						<option value="">Select origin</option>
						{#each ORIGINS as o}
							<option value={o} selected={bean.origin === o}>{o}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="roast_level">Roast Level</label>
					<select id="roast_level" name="roast_level">
						<option value="">Select level</option>
						{#each ROAST_LEVELS as level}
							<option value={level.value} selected={bean.roast_level === level.value}>{level.label}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="roaster_country">Roaster Country</label>
					<input type="text" id="roaster_country" name="roaster_country" value={bean.roaster_country ?? ''} />
				</div>
			</div>

			<div class="form-group">
				<label for="tasting_notes">Roaster Tasting Notes</label>
				<textarea id="tasting_notes" name="tasting_notes" rows="2">{bean.tasting_notes ?? ''}</textarea>
			</div>
		</div>

		<AdvancedToggle startOpen={true}>
			<div class="form-section">
				<h2>Advanced Info</h2>
				<div class="form-row">
					<div class="form-group">
						<label for="caffeine">Caffeine</label>
						<select id="caffeine" name="caffeine">
							<option value="full" selected={bean.caffeine === 'full'}>Full Caf</option>
							<option value="decaf" selected={bean.caffeine === 'decaf'}>Decaf</option>
							<option value="half-caf" selected={bean.caffeine === 'half-caf'}>Half Caf</option>
						</select>
					</div>
					<div class="form-group">
						<label for="roaster_city">Roaster City</label>
						<input type="text" id="roaster_city" name="roaster_city" value={bean.roaster_city ?? ''} />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="weight_grams">Bag Weight (g)</label>
						<input type="number" id="weight_grams" name="weight_grams" step="any" value={bean.weight_grams ?? ''} />
					</div>
					<div class="form-group">
						<label for="price">Price</label>
						<input type="number" id="price" name="price" step="0.01" value={bean.price ?? ''} />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="currency">Currency</label>
						<input type="text" id="currency" name="currency" maxlength="3" value={bean.currency ?? ''} />
					</div>
					<div class="form-group">
						<label for="product_url">Product URL</label>
						<input type="url" id="product_url" name="product_url" value={bean.product_url ?? ''} />
					</div>
				</div>

				<div class="form-group">
					<label for="submitted_by">Submitted By</label>
					<input type="text" id="submitted_by" name="submitted_by" value={bean.submitted_by ?? ''} />
				</div>
			</div>
		</AdvancedToggle>

		<div class="form-buttons">
			<button type="submit" class="btn btn-primary">Save Changes</button>
			<a href="/admin" class="btn btn-secondary">Cancel</a>
		</div>
	</form>
</div>

<style>
	h1 {
		margin-bottom: 1.5rem;
	}

	.form-buttons {
		display: flex;
		gap: 0.75rem;
	}
</style>
