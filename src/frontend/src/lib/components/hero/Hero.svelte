<script lang="ts">
	import Actions from '$lib/components/hero/Actions.svelte';
	import HeaderHero from '$lib/components/layout/HeaderHero.svelte';
	import Alpha from '$lib/components/core/Alpha.svelte';
	import { erc20TokensInitialized } from '$eth/derived/erc20.derived';
	import { fade, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Logo from '$lib/components/ui/Logo.svelte';
	import { token } from '$lib/derived/token.derived';
	import Balance from '$lib/components/hero/Balance.svelte';
	import Erc20Icp from '$lib/components/core/Erc20Icp.svelte';
	import ExchangeBalance from '$lib/components/exchange/ExchangeBalance.svelte';
	import { isErc20Icp } from '$eth/utils/token.utils';
	import { networkICP } from '$lib/derived/network.derived';
	import SkeletonLogo from '$lib/components/ui/SkeletonLogo.svelte';

	export let usdTotal = false;
	export let summary = false;
	export let actions = true;
	export let send = false;

	let background: 'eth' | 'icp';
	$: background = $networkICP ? 'icp' : 'eth';

	let displayTokenSymbol = false;
	$: displayTokenSymbol = summary && $erc20TokensInitialized;
</script>

<div class={`hero ${background}`}>
	<HeaderHero />

	<article
		class="flex flex-col text-off-white rounded-lg pt-1 sm:pt-3 pb-2 px-8 relative main 2xl:mt-[-70px]"
	>
		<Alpha />

		{#if summary}
			<div transition:slide={{ delay: 0, duration: 250, easing: quintOut, axis: 'y' }}>
				<div class="icon flex flex-col items-start mt-6 md:mt-12 mb-0.5 pt-2">
					{#if displayTokenSymbol}
						<div in:fade>
							<Logo src={$token.icon} size="64px" alt={`${$token.name} logo`} color="off-white" />
						</div>
					{:else}
						<SkeletonLogo size="big" />
					{/if}
				</div>

				<Balance />
			</div>
		{/if}

		{#if usdTotal}
			<div transition:slide={{ delay: 0, duration: 250, easing: quintOut, axis: 'y' }}>
				<ExchangeBalance />
			</div>
		{/if}

		{#if actions}
			<div transition:slide={{ delay: 0, duration: 250, easing: quintOut, axis: 'y' }}>
				<Actions {send} />
			</div>
		{/if}

		{#if isErc20Icp($token)}
			<Erc20Icp />
		{/if}
	</article>
</div>

<style lang="scss">
	.hero {
		background: linear-gradient(61.79deg, #321469 62.5%, var(--color-misty-rose) 100%);

		--alpha-color: var(--color-grey);

		&.icp {
			background: radial-gradient(66.11% 97.11% at 50% 115.28%, #300097 0%, #1f005e 100%);
		}
	}

	.icon {
		min-height: calc(64px + var(--padding-4x));
	}
</style>
