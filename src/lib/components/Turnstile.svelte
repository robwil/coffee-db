<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';

	let container: HTMLDivElement;

	onMount(() => {
		const siteKey = env.PUBLIC_TURNSTILE_SITE_KEY;
		if (!siteKey) return;

		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);

		script.onload = () => {
			(window as any).turnstile.render(container, {
				sitekey: siteKey,
				theme: 'light'
			});
		};

		return () => {
			script.remove();
		};
	});
</script>

<div bind:this={container} class="turnstile-wrapper">
	<noscript>Please enable JavaScript to complete the CAPTCHA.</noscript>
</div>

<style>
	.turnstile-wrapper {
		margin: 1rem 0;
	}
</style>
