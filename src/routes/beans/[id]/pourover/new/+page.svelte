<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import EquipmentAutocomplete from '$lib/components/EquipmentAutocomplete.svelte';

	let { data }: { data: PageData } = $props();
	let showAdvanced = $state(false);
</script>

<div class="container">
	<p class="breadcrumb">
		<a href="/beans/{data.bean.id}">{data.bean.name}</a> &rsaquo; Add Pourover Recipe
	</p>
	<h1>Add Pourover Recipe</h1>

	<form method="POST" use:enhance class="brew-form">
		<div class="form-section">
			<h2>Core Recipe</h2>

			<EquipmentAutocomplete
				label="Dripper"
				name="dripper"
				endpoint="/api/drippers"
				placeholder="Search drippers..."
			/>

			<div class="form-row">
				<div class="form-group">
					<label for="dose_grams">Dose (g) *</label>
					<input type="number" id="dose_grams" name="dose_grams" step="0.1" required placeholder="15.0" />
				</div>
				<div class="form-group">
					<label for="water_grams">Water (g)</label>
					<input type="number" id="water_grams" name="water_grams" step="1" placeholder="250" />
				</div>
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="total_time_seconds">Total Time (seconds)</label>
					<input type="number" id="total_time_seconds" name="total_time_seconds" step="1" placeholder="180" />
				</div>
				<div class="form-group">
					<label for="rating">Rating (1-10)</label>
					<input type="number" id="rating" name="rating" min="1" max="10" step="0.5" placeholder="8" />
				</div>
			</div>

			<EquipmentAutocomplete
				label="Grinder"
				name="grinder"
				endpoint="/api/grinders"
				placeholder="Search grinders..."
			/>

			<div class="form-group">
				<label for="grind_setting">Grind Setting</label>
				<input type="text" id="grind_setting" name="grind_setting" placeholder="e.g. 24, medium-fine" />
			</div>

			<div class="form-group">
				<label for="tasting_notes">Tasting Notes</label>
				<textarea id="tasting_notes" name="tasting_notes" rows="2" placeholder="How did it taste?"></textarea>
			</div>
		</div>

		<button type="button" class="btn btn-secondary toggle-btn" onclick={() => (showAdvanced = !showAdvanced)}>
			{showAdvanced ? 'Hide' : 'Show'} advanced fields
		</button>

		{#if showAdvanced}
			<div class="form-section">
				<h2>Advanced</h2>

				<div class="form-row">
					<div class="form-group">
						<label for="filter_type">Filter Type</label>
						<select id="filter_type" name="filter_type">
							<option value="">Select type</option>
							<option value="paper">Paper</option>
							<option value="metal">Metal</option>
							<option value="cloth">Cloth</option>
						</select>
					</div>
					<div class="form-group">
						<label for="days_rested">Days Rested</label>
						<input type="number" id="days_rested" name="days_rested" placeholder="14" />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="water_temp_c">Water Temp (&deg;C)</label>
						<input type="number" id="water_temp_c" name="water_temp_c" step="0.1" placeholder="96.0" />
					</div>
					<div class="form-group">
						<label for="kettle">Kettle</label>
						<input type="text" id="kettle" name="kettle" placeholder="e.g. Fellow Stagg EKG" />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="bloom_time_seconds">Bloom Time (s)</label>
						<input type="number" id="bloom_time_seconds" name="bloom_time_seconds" step="1" placeholder="45" />
					</div>
					<div class="form-group">
						<label for="bloom_water_grams">Bloom Water (g)</label>
						<input type="number" id="bloom_water_grams" name="bloom_water_grams" step="1" placeholder="45" />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="pour_count">Number of Pours</label>
						<input type="number" id="pour_count" name="pour_count" placeholder="4" />
					</div>
					<div class="form-group">
						<label for="pour_technique">Pour Technique</label>
						<input type="text" id="pour_technique" name="pour_technique" placeholder="e.g. 4:6 method, Hoffmann" />
					</div>
				</div>

				<div class="form-group">
					<label for="burr_set">Burr Set</label>
					<input type="text" id="burr_set" name="burr_set" placeholder="e.g. Stock burrs" />
				</div>

				<div class="form-group">
					<label for="additional_notes">Additional Notes</label>
					<textarea id="additional_notes" name="additional_notes" rows="2"></textarea>
				</div>

				<div class="form-group">
					<label for="submitted_by">Your Name (optional)</label>
					<input type="text" id="submitted_by" name="submitted_by" placeholder="Anonymous" />
				</div>
			</div>
		{/if}

		<button type="submit" class="btn btn-primary">Submit Recipe</button>
	</form>
</div>

<style>
	.breadcrumb {
		font-size: 0.9rem;
		color: var(--color-text-muted);
		margin-bottom: 0.5rem;
	}

	h1 {
		margin-bottom: 1.5rem;
	}

	.brew-form {
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
