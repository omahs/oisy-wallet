<script lang="ts">
	import { onMount } from 'svelte';
	import { isAirdropManager } from '$airdrop/api/airdrop.api';
	import { toastsError } from '$lib/stores/toasts.store';
	import { authStore } from '$lib/stores/auth.store';

	let manager = false;

	onMount(async () => {
		try {
			manager = await isAirdropManager($authStore.identity);
		} catch (err: unknown) {
			toastsError({
				msg: { text: 'Cannot fetch the manager status of the user.' },
				err
			});
		}
	});
</script>

{#if manager}
	<slot />
{/if}
