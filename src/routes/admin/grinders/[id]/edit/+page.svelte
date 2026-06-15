<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const grinder = $derived(data.grinder as Record<string, unknown>);
</script>

<div class="container">
	<p class="breadcrumb">
		<a href="/admin?tab=grinders">Admin</a> &rsaquo; Edit Grinder
	</p>
	<h1>Edit Grinder — {grinder.name}</h1>

	<form method="POST" use:enhance class="brew-form">
		<div class="form-section">
			<div class="form-group">
				<label for="name">Name *</label>
				<input type="text" id="name" name="name" required value={grinder.name ?? ''} />
			</div>
			<div class="form-group">
				<label for="manufacturer">Manufacturer</label>
				<input type="text" id="manufacturer" name="manufacturer" value={grinder.manufacturer ?? ''} />
			</div>
		</div>

		<div class="form-buttons">
			<button type="submit" class="btn btn-primary">Save Changes</button>
			<a href="/admin?tab=grinders" class="btn btn-secondary">Cancel</a>
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
