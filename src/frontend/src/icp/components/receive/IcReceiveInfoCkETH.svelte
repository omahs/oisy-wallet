<script lang="ts">
	import { icrcAccountIdentifierText } from '$icp/derived/ic.derived';
	import { modalStore } from '$lib/stores/modal.store';
	import Hr from '$lib/components/ui/Hr.svelte';
	import { createEventDispatcher } from 'svelte';
	import ReceiveAddress from '$icp-eth/components/receive/ReceiveAddress.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { OISY_NAME } from '$lib/constants/oisy.constants';

	const dispatch = createEventDispatcher();

	const displayQRCode = (addressType: string) => dispatch('icQRCode', addressType);
</script>

<ReceiveAddress
	labelRef="wallet-address"
	address={$icrcAccountIdentifierText ?? ''}
	qrCodeAriaLabel="Display wallet address as a QR code"
	copyAriaLabel="Wallet address copied to clipboard."
	on:click={() => displayQRCode($icrcAccountIdentifierText ?? '')}
>
	<svelte:fragment slot="title">Wallet address</svelte:fragment>
	<svelte:fragment slot="text"
		>Use this address to transfer ckETH to and from your wallet.
	</svelte:fragment>
</ReceiveAddress>

<div class="mb-6">
	<Hr />
</div>

<Value ref="ethereum-helper-contract" element="div">
	<svelte:fragment slot="label">Receive from Ethereum Network</svelte:fragment>

	<p class="text-misty-rose break-normal py-2">
		Converting ETH into ckETH requires a call to a smart contract on Ethereum and passing your IC
		principal as argument – {OISY_NAME} simplifies this procedure by enabling you to perform the conversion
		directly within the wallet.
	</p>
</Value>

<button class="secondary full center mt-6 mb-8" on:click={() => dispatch('icConvert')}>
	<span class="text-dark-slate-blue font-bold">Learn how to convert ETH to ckETH</span>
</button>

<button class="primary full center text-center mb-6" on:click={modalStore.close}>Done</button>
