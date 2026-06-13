<script lang="ts">
	import { enhance } from '$app/forms';
	import { ORIGINS, ROAST_LEVELS } from '$lib/types';

	let showAdvanced = $state(false);
</script>

<div class="container">
	<h1>Add a New Bean</h1>

	<form method="POST" use:enhance class="bean-form">
		<div class="form-section">
			<h2>Core Info</h2>
			<div class="form-group">
				<label for="name">Bean Name *</label>
				<input type="text" id="name" name="name" required placeholder="e.g. Chelchele" />
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="roaster">Roaster</label>
					<input type="text" id="roaster" name="roaster" placeholder="e.g. PERC" />
				</div>
				<div class="form-group">
					<label for="origin">Origin</label>
					<select id="origin" name="origin">
						<option value="">Select origin</option>
						{#each ORIGINS as o}
							<option value={o}>{o}</option>
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
							<option value={level.value}>{level.label}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="roaster_country">Roaster Country</label>
					<input type="text" id="roaster_country" name="roaster_country" placeholder="e.g. United States" />
				</div>
			</div>
		</div>

		<button type="button" class="btn btn-secondary toggle-btn" onclick={() => (showAdvanced = !showAdvanced)}>
			{showAdvanced ? 'Hide' : 'Show'} advanced fields
		</button>

		{#if showAdvanced}
			<div class="form-section">
				<h2>Advanced Info</h2>
				<div class="form-row">
					<div class="form-group">
						<label for="caffeine">Caffeine</label>
						<select id="caffeine" name="caffeine">
							<option value="full">Full Caf</option>
							<option value="decaf">Decaf</option>
							<option value="half-caf">Half Caf</option>
						</select>
					</div>
					<div class="form-group">
						<label for="roaster_city">Roaster City</label>
						<input type="text" id="roaster_city" name="roaster_city" placeholder="e.g. Savannah" />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="weight_grams">Bag Weight (g)</label>
						<input type="number" id="weight_grams" name="weight_grams" step="any" placeholder="250" />
					</div>
					<div class="form-group">
						<label for="price">Price</label>
						<input type="number" id="price" name="price" step="0.01" placeholder="18.00" />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="currency">Currency</label>
						<input type="text" id="currency" name="currency" placeholder="USD" maxlength="3" />
					</div>
					<div class="form-group">
						<label for="product_url">Product URL</label>
						<input type="url" id="product_url" name="product_url" placeholder="https://..." />
					</div>
				</div>

				<div class="form-group">
					<label for="tasting_notes">Tasting Notes</label>
					<textarea id="tasting_notes" name="tasting_notes" rows="2" placeholder="e.g. Blueberry, jasmine, dark chocolate"></textarea>
				</div>

				<div class="form-group">
					<label for="submitted_by">Your Name (optional)</label>
					<input type="text" id="submitted_by" name="submitted_by" placeholder="Anonymous" />
				</div>
			</div>
		{/if}

		<button type="submit" class="btn btn-primary">Add Bean</button>
	</form>
</div>

<style>
	h1 {
		margin-bottom: 1.5rem;
	}

	.bean-form {
		max-width: 600px;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-section h2 {
		font-size: 1rem;
		color: var(--color-text-muted);
		border-bottom: 1px solid var(--color-border-light);
		padding-bottom: 0.5rem;
	}

	.toggle-btn {
		align-self: flex-start;
	}
</style>
