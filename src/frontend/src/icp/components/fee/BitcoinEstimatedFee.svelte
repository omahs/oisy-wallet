<script lang="ts">
	import { slide } from 'svelte/transition';
	import { nonNullish } from '@dfinity/utils';
	import { BTC_DECIMALS } from '$icp/constants/ckbtc.constants';
	import { formatToken } from '$lib/utils/format.utils';
	import { BigNumber } from '@ethersproject/bignumber';
	import Value from '$lib/components/ui/Value.svelte';
	import { getContext } from 'svelte';
	import { IC_FEE_CONTEXT_KEY, type IcFeeContext } from '$icp/stores/ic-fee.store';

	const { store: storeFeeData } = getContext<IcFeeContext>(IC_FEE_CONTEXT_KEY);

	let bitcoinEstimatedFee: bigint | undefined;
	$: bitcoinEstimatedFee =
		nonNullish($storeFeeData) && nonNullish($storeFeeData.bitcoinFee)
			? $storeFeeData.bitcoinFee.bitcoin_fee + $storeFeeData.bitcoinFee.minter_fee
			: undefined;
</script>

{#if nonNullish(bitcoinEstimatedFee)}
	<div transition:slide={{ duration: 250 }}>
		<Value ref="kyt-fee">
			<svelte:fragment slot="label">Estimated BTC Network Fee</svelte:fragment>

			{formatToken({
				value: BigNumber.from(bitcoinEstimatedFee),
				unitName: BTC_DECIMALS,
				displayDecimals: BTC_DECIMALS
			})}
			BTC
		</Value>
	</div>
{/if}
