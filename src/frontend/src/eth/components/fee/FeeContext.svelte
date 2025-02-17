<script lang="ts">
	import type { WebSocketListener } from '$eth/types/listener';
	import { ETHEREUM_TOKEN_ID } from '$lib/constants/tokens.constants';
	import { getFeeData } from '$eth/providers/infura.providers';
	import type { Erc20Token } from '$eth/types/erc20';
	import { address } from '$lib/derived/address.derived';
	import { toastsError, toastsHide } from '$lib/stores/toasts.store';
	import { debounce } from '@dfinity/utils';
	import { initMinedTransactionsListener } from '$eth/services/eth-listener.services';
	import { getContext, onDestroy } from 'svelte';
	import { FEE_CONTEXT_KEY, type FeeContext } from '$eth/stores/fee.store';
	import { parseToken } from '$lib/utils/parse.utils';
	import { getErc20FeeData, getEthFeeData, type GetFeeData } from '$eth/services/fee.services';
	import type { Network } from '$lib/types/network';
	import { ckEthHelperContractAddressStore } from '$icp-eth/stores/cketh.store';
	import { SEND_CONTEXT_KEY, type SendContext } from '$icp-eth/stores/send.store';
	import { mapAddressStartsWith0x } from '$icp-eth/utils/eth.utils';

	export let observe: boolean;
	export let destination = '';
	export let amount: string | number | undefined = undefined;
	export let network: Network | undefined = undefined;

	const { store }: FeeContext = getContext<FeeContext>(FEE_CONTEXT_KEY);

	const { sendTokenId, sendToken } = getContext<SendContext>(SEND_CONTEXT_KEY);

	/**
	 * Updating and fetching fee
	 */

	let listener: WebSocketListener | undefined = undefined;

	const errorMsgs: symbol[] = [];

	const updateFeeData = async () => {
		try {
			const params: GetFeeData = {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				address: mapAddressStartsWith0x(destination !== '' ? destination : $address!)
			};

			if ($sendTokenId === ETHEREUM_TOKEN_ID) {
				store.setFee({
					...(await getFeeData()),
					gas: await getEthFeeData({
						...params,
						helperContractAddress: $ckEthHelperContractAddressStore?.[$sendTokenId]
					})
				});
				return;
			}

			store.setFee({
				...(await getFeeData()),
				gas: await getErc20FeeData({
					contract: $sendToken as Erc20Token,
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					address: mapAddressStartsWith0x(destination !== '' ? destination : $address!),
					amount: parseToken({ value: `${amount ?? '1'}` }),
					network
				})
			});
		} catch (err: unknown) {
			toastsHide(errorMsgs);

			errorMsgs.push(
				toastsError({
					msg: { text: `Cannot fetch gas fee.` },
					err
				})
			);
		}
	};

	const debounceUpdateFeeData = debounce(updateFeeData);

	const obverseFeeData = async (watch: boolean) => {
		await listener?.disconnect();

		if (!watch) {
			return;
		}

		await updateFeeData();
		listener = initMinedTransactionsListener(async () => debounceUpdateFeeData());
	};

	onDestroy(() => listener?.disconnect());

	/**
	 * Observe input properties for erc20
	 */

	$: obverseFeeData(observe);

	$: amount, destination, $ckEthHelperContractAddressStore, debounceUpdateFeeData();
</script>

<slot />
