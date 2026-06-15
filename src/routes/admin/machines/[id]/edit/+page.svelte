<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const machine = $derived(data.machine as Record<string, unknown>);
</script>

<div class="container">
	<p class="breadcrumb">
		<a href="/admin?tab=machines">Admin</a> &rsaquo; Edit Machine
	</p>
	<h1>Edit Machine — {machine.name}</h1>

	<form method="POST" use:enhance class="brew-form">
		<div class="form-section">
			<div class="form-group">
				<label for="name">Name *</label>
				<input type="text" id="name" name="name" required value={machine.name ?? ''} />
			</div>
			<div class="form-group">
				<label for="manufacturer">Manufacturer</label>
				<input type="text" id="manufacturer" name="manufacturer" value={machine.manufacturer ?? ''} />
			</div>
		</div>

		<div class="form-buttons">
			<button type="submit" class="btn btn-primary">Save Changes</button>
			<a href="/admin?tab=machines" class="btn btn-secondary">Cancel</a>
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
