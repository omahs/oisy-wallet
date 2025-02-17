<script lang="ts">
	import { toastsError } from '$lib/stores/toasts.store';
	import { send as executeSend } from '$eth/services/send.services';
	import { isNullish } from '@dfinity/utils';
	import { type WizardStep } from '@dfinity/gix-components';
	import SendForm from './SendForm.svelte';
	import SendReview from './SendReview.svelte';
	import InProgressWizard from '$lib/components/ui/InProgressWizard.svelte';
	import { SendStep } from '$lib/enums/steps';
	import { address } from '$lib/derived/address.derived';
	import {
		FEE_CONTEXT_KEY,
		type FeeContext as FeeContextType,
		initFeeStore
	} from '$eth/stores/fee.store';
	import { createEventDispatcher, getContext, setContext } from 'svelte';
	import FeeContext from '$eth/components/fee/FeeContext.svelte';
	import { SEND_STEPS } from '$lib/constants/steps.constants';
	import { parseToken } from '$lib/utils/parse.utils';
	import { invalidAmount, isNullishOrEmpty } from '$lib/utils/input.utils';
	import type { Network } from '$lib/types/network';
	import { authStore } from '$lib/stores/auth.store';
	import { ckEthHelperContractAddressStore } from '$icp-eth/stores/cketh.store';
	import { assertCkEthHelperContractAddressLoaded } from '$icp-eth/services/cketh.services';
	import { SEND_CONTEXT_KEY, type SendContext } from '$icp-eth/stores/send.store';
	import { mapAddressStartsWith0x } from '$icp-eth/utils/eth.utils';

	export let currentStep: WizardStep | undefined;
	export let formCancelAction: 'back' | 'close' = 'close';

	/**
	 * Fee context store
	 */

	let storeFeeData = initFeeStore();

	setContext<FeeContextType>(FEE_CONTEXT_KEY, {
		store: storeFeeData
	});

	/**
	 * Send context store
	 */

	const { sendTokenDecimals, sendTokenId, sendToken, sendTokenStandard, sendPurpose } =
		getContext<SendContext>(SEND_CONTEXT_KEY);

	/**
	 * Props
	 */

	export let destination = '';
	export let network: Network | undefined = undefined;
	export let amount: number | undefined = undefined;
	export let sendProgressStep: string;

	let destinationEditable = true;
	$: destinationEditable = sendPurpose !== 'convert-eth-to-cketh';

	/**
	 * Send
	 */

	const dispatch = createEventDispatcher();

	const send = async () => {
		if (isNullishOrEmpty(destination)) {
			toastsError({
				msg: { text: `Destination address is invalid.` }
			});
			return;
		}

		if (invalidAmount(amount) || isNullish(amount)) {
			toastsError({
				msg: { text: `Amount is invalid.` }
			});
			return;
		}

		if (isNullish($storeFeeData)) {
			toastsError({
				msg: { text: `Gas fees are not defined.` }
			});
			return;
		}

		const { valid } = assertCkEthHelperContractAddressLoaded({
			tokenStandard: $sendTokenStandard,
			helperContractAddress: $ckEthHelperContractAddressStore?.[$sendTokenId],
			network
		});

		if (!valid) {
			return;
		}

		// https://github.com/ethers-io/ethers.js/discussions/2439#discussioncomment-1857403
		const { maxFeePerGas, maxPriorityFeePerGas, gas } = $storeFeeData;

		// https://docs.ethers.org/v5/api/providers/provider/#Provider-getFeeData
		// exceeds block gas limit
		if (isNullish(maxFeePerGas) || isNullish(maxPriorityFeePerGas)) {
			toastsError({
				msg: { text: `Max fee per gas or max priority fee per gas is undefined.` }
			});
			return;
		}

		// Unexpected errors
		if (isNullish($address)) {
			toastsError({
				msg: { text: 'Address is unknown.' }
			});
			return;
		}

		dispatch('icNext');

		try {
			await executeSend({
				from: $address,
				to: mapAddressStartsWith0x(destination),
				progress: (step: SendStep) => (sendProgressStep = step),
				token: $sendToken,
				amount: parseToken({
					value: `${amount}`,
					unitName: $sendTokenDecimals
				}),
				maxFeePerGas,
				maxPriorityFeePerGas,
				gas,
				network,
				identity: $authStore.identity,
				ckEthHelperContractAddress: $ckEthHelperContractAddressStore?.[$sendTokenId]
			});

			setTimeout(() => close(), 750);
		} catch (err: unknown) {
			toastsError({
				msg: { text: `Something went wrong while sending the transaction.` },
				err
			});

			dispatch('icBack');
		}
	};

	const close = () => dispatch('icClose');
	const back = () => dispatch('icSendBack');
</script>

<FeeContext {amount} {destination} observe={currentStep?.name !== 'Sending'} {network}>
	{#if currentStep?.name === 'Review'}
		<SendReview on:icBack on:icSend={send} {destination} {amount} {network} {destinationEditable} />
	{:else if currentStep?.name === 'Sending'}
		<InProgressWizard progressStep={sendProgressStep} steps={SEND_STEPS} />
	{:else if currentStep?.name === 'Send'}
		<SendForm
			on:icNext
			on:icClose={close}
			bind:destination
			bind:amount
			bind:network
			{destinationEditable}
		>
			<svelte:fragment slot="cancel">
				{#if formCancelAction === 'back'}
					<button type="button" class="secondary" on:click={back}>Back</button>
				{:else}
					<button type="button" class="secondary" on:click={close}>Cancel</button>
				{/if}
			</svelte:fragment>
		</SendForm>
	{:else}
		<slot />
	{/if}
</FeeContext>
