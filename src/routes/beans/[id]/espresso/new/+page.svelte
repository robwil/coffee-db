<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import EquipmentAutocomplete from '$lib/components/EquipmentAutocomplete.svelte';
	import AdvancedToggle from '$lib/components/AdvancedToggle.svelte';

	let { data }: { data: PageData } = $props();
	const bean = $derived(data.bean as unknown as { id: string; name: string });
</script>

<div class="container">
	<p class="breadcrumb">
		<a href="/beans/{bean.id}">{bean.name}</a> &rsaquo; Add Espresso Recipe
	</p>
	<h1>Add Espresso Recipe</h1>

	<form method="POST" use:enhance class="brew-form">
		<div class="form-section">
			<h2>Core Recipe</h2>

			<EquipmentAutocomplete
				label="Machine"
				name="machine"
				endpoint="/api/machines"
				placeholder="Search machines..."
				required
			/>

			<div class="form-row">
				<div class="form-group">
					<label for="dose_grams">Dose (g) *</label>
					<input type="number" id="dose_grams" name="dose_grams" step="0.1" required placeholder="18.0" />
				</div>
				<div class="form-group">
					<label for="yield_grams">Yield (g) *</label>
					<input type="number" id="yield_grams" name="yield_grams" step="0.1" required placeholder="36.0" />
				</div>
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="total_time_seconds">Total Time (seconds) *</label>
					<input type="number" id="total_time_seconds" name="total_time_seconds" step="1" required placeholder="28" />
				</div>
				<div class="form-group">
					<label for="rating">Rating (1-10) *</label>
					<input type="number" id="rating" name="rating" min="1" max="10" step="0.5" required placeholder="8" />
				</div>
			</div>

			<EquipmentAutocomplete
				label="Grinder"
				name="grinder"
				endpoint="/api/grinders"
				placeholder="Search grinders..."
				optional
			/>

			<div class="form-group">
				<label for="grind_setting">Grind Setting <span class="optional-label">(optional)</span></label>
				<input type="text" id="grind_setting" name="grind_setting" placeholder="e.g. 15, 2.0, 12 clicks" />
			</div>

			<div class="form-group">
				<label for="tasting_notes">Tasting Notes *</label>
				<textarea id="tasting_notes" name="tasting_notes" rows="2" required placeholder="How did it taste?"></textarea>
			</div>
		</div>

		<AdvancedToggle>
			<div class="form-section">
				<h2>Advanced</h2>

				<div class="form-row">
					<div class="form-group">
						<label for="preinfusion_time_seconds">Pre-infusion Time (s)</label>
						<input type="number" id="preinfusion_time_seconds" name="preinfusion_time_seconds" step="1" placeholder="5" />
					</div>
					<div class="form-group">
						<label for="days_rested">Days Rested</label>
						<input type="number" id="days_rested" name="days_rested" placeholder="14" />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="water_temp_c">Water Temp (&deg;C)</label>
						<input type="number" id="water_temp_c" name="water_temp_c" step="0.1" placeholder="93.0" />
					</div>
					<div class="form-group">
						<label for="basket">Basket</label>
						<input type="text" id="basket" name="basket" placeholder="e.g. IMS 18g" />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="burr_set">Burr Set</label>
						<input type="text" id="burr_set" name="burr_set" placeholder="e.g. SSP Multipurpose" />
					</div>
					<div class="form-group">
						<label for="pressure_profile">Pressure Profile</label>
						<input type="text" id="pressure_profile" name="pressure_profile" placeholder="e.g. 6-9 bar ramp" />
					</div>
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
		</AdvancedToggle>

		<button type="submit" class="btn btn-primary">Submit Recipe</button>
	</form>
</div>

<style>
	h1 {
		margin-bottom: 1.5rem;
	}
</style>
