<script lang="ts">
	import type { BigNumber } from '@ethersproject/bignumber';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import { getContext, onDestroy } from 'svelte';
	import { formatToken } from '$lib/utils/format.utils';
	import type { FeeContext } from '$eth/stores/fee.store';
	import { FEE_CONTEXT_KEY } from '$eth/stores/fee.store';
	import { ETHEREUM_TOKEN } from '$lib/constants/tokens.constants';
	import { maxGasFee } from '$eth/utils/fee.utils';
	import { EIGHT_DECIMALS } from '$lib/constants/app.constants';

	const { store: feeData }: FeeContext = getContext<FeeContext>(FEE_CONTEXT_KEY);

	let fee: BigNumber | undefined | null = undefined;

	let timer: NodeJS.Timeout | undefined;

	$: $feeData,
		(() => {
			fee = undefined;

			if (isNullish($feeData) || isNullish($feeData?.maxFeePerGas)) {
				return;
			}

			const calculateFee = () => {
				if (isNullish($feeData) || isNullish($feeData?.maxFeePerGas)) {
					return;
				}

				fee = maxGasFee($feeData);
			};

			timer = setTimeout(calculateFee, 500);
		})();

	onDestroy(() => {
		if (isNullish(timer)) {
			return;
		}

		clearInterval(timer);
	});
</script>

<label for="balance" class="font-bold px-4.5"
	>Max fee <small>(likely in &lt; 30 seconds)</small>:</label
>
<div id="balance" class="font-normal px-4.5 mb-4 break-all" style="min-height: 24px">
	{#if nonNullish(fee)}
		<div in:fade>
			{formatToken({
				value: fee,
				displayDecimals: EIGHT_DECIMALS
			})}
			{ETHEREUM_TOKEN.symbol}
		</div>
	{/if}
</div>
