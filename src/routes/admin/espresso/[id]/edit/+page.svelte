<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import EquipmentAutocomplete from '$lib/components/EquipmentAutocomplete.svelte';
	import AdvancedToggle from '$lib/components/AdvancedToggle.svelte';

	let { data }: { data: PageData } = $props();
	const brew = data.brew as Record<string, unknown>;
</script>

<div class="container">
	<p class="breadcrumb">
		<a href="/admin">Admin</a> &rsaquo; Edit Espresso Brew
	</p>
	<h1>Edit Espresso — {brew.bean_name}</h1>

	<form method="POST" use:enhance class="brew-form">
		<div class="form-section">
			<h2>Core Recipe</h2>

			<EquipmentAutocomplete
				label="Machine"
				name="machine"
				endpoint="/api/machines"
				placeholder="Search machines..."
				required
				initialId={brew.current_machine_id?.toString() ?? ''}
				initialName={brew.machine_name?.toString() ?? ''}
			/>

			<div class="form-row">
				<div class="form-group">
					<label for="dose_grams">Dose (g) *</label>
					<input type="number" id="dose_grams" name="dose_grams" step="0.1" required value={brew.dose_grams} />
				</div>
				<div class="form-group">
					<label for="yield_grams">Yield (g) *</label>
					<input type="number" id="yield_grams" name="yield_grams" step="0.1" required value={brew.yield_grams} />
				</div>
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="total_time_seconds">Total Time (seconds) *</label>
					<input type="number" id="total_time_seconds" name="total_time_seconds" step="1" required value={brew.total_time_seconds ?? ''} />
				</div>
				<div class="form-group">
					<label for="rating">Rating (1-10) *</label>
					<input type="number" id="rating" name="rating" min="1" max="10" step="0.5" required value={brew.rating ?? ''} />
				</div>
			</div>

			<EquipmentAutocomplete
				label="Grinder"
				name="grinder"
				endpoint="/api/grinders"
				placeholder="Search grinders..."
				optional
				initialId={brew.current_grinder_id?.toString() ?? ''}
				initialName={brew.grinder_name?.toString() ?? ''}
			/>

			<div class="form-group">
				<label for="grind_setting">Grind Setting <span class="optional-label">(optional)</span></label>
				<input type="text" id="grind_setting" name="grind_setting" value={brew.grind_setting ?? ''} />
			</div>

			<div class="form-group">
				<label for="tasting_notes">Tasting Notes *</label>
				<textarea id="tasting_notes" name="tasting_notes" rows="2" required>{brew.tasting_notes ?? ''}</textarea>
			</div>
		</div>

		<AdvancedToggle startOpen={true}>
			<div class="form-section">
				<h2>Advanced</h2>

				<div class="form-row">
					<div class="form-group">
						<label for="preinfusion_time_seconds">Pre-infusion Time (s)</label>
						<input type="number" id="preinfusion_time_seconds" name="preinfusion_time_seconds" step="1" value={brew.preinfusion_time_seconds ?? ''} />
					</div>
					<div class="form-group">
						<label for="days_rested">Days Rested</label>
						<input type="number" id="days_rested" name="days_rested" value={brew.days_rested ?? ''} />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="water_temp_c">Water Temp (&deg;C)</label>
						<input type="number" id="water_temp_c" name="water_temp_c" step="0.1" value={brew.water_temp_c ?? ''} />
					</div>
					<div class="form-group">
						<label for="basket">Basket</label>
						<input type="text" id="basket" name="basket" value={brew.basket ?? ''} />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="burr_set">Burr Set</label>
						<input type="text" id="burr_set" name="burr_set" value={brew.burr_set ?? ''} />
					</div>
					<div class="form-group">
						<label for="pressure_profile">Pressure Profile</label>
						<input type="text" id="pressure_profile" name="pressure_profile" value={brew.pressure_profile ?? ''} />
					</div>
				</div>

				<div class="form-group">
					<label for="additional_notes">Additional Notes</label>
					<textarea id="additional_notes" name="additional_notes" rows="2">{brew.additional_notes ?? ''}</textarea>
				</div>

				<div class="form-group">
					<label for="submitted_by">Submitted By</label>
					<input type="text" id="submitted_by" name="submitted_by" value={brew.submitted_by ?? ''} />
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
