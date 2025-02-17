import { ckEthHelperContractAddress } from '$icp-eth/api/cketh-minter.api';
import {
	ckEthHelperContractAddressStore,
	type CkEthHelperContractAddressData
} from '$icp-eth/stores/cketh.store';
import type { IcCkCanisters } from '$icp/types/ic';
import { queryAndUpdate } from '$lib/actors/query.ic';
import { ETHEREUM_NETWORK } from '$lib/constants/networks.constants';
import { toastsError } from '$lib/stores/toasts.store';
import type { ETH_ADDRESS } from '$lib/types/address';
import type { Network } from '$lib/types/network';
import type { TokenId, TokenStandard } from '$lib/types/token';
import { isNetworkICP } from '$lib/utils/network.utils';
import { AnonymousIdentity } from '@dfinity/agent';
import { isNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const loadCkEthHelperContractAddress = async ({
	tokenId,
	canisters: { minterCanisterId }
}: {
	tokenId: TokenId;
	canisters: IcCkCanisters;
}) => {
	const addressInStore = get(ckEthHelperContractAddressStore);

	// We try to load only once per session the help contract address
	if (addressInStore?.[tokenId] !== undefined) {
		return;
	}

	await queryAndUpdate<ETH_ADDRESS>({
		request: ({ identity: _, certified }) =>
			ckEthHelperContractAddress({
				minterCanisterId,
				identity: new AnonymousIdentity(),
				certified
			}),
		onLoad: ({ response: data, certified }) =>
			ckEthHelperContractAddressStore.set({ tokenId, data: { data, certified } }),
		onCertifiedError: ({ error }) => {
			// We silence the error here because we display a visual error when we try to effectively use the information
			console.error(error);

			ckEthHelperContractAddressStore.reset(tokenId);
		},
		identity: new AnonymousIdentity()
	});
};

export const assertCkEthHelperContractAddressLoaded = ({
	helperContractAddress,
	tokenStandard,
	network
}: {
	helperContractAddress: CkEthHelperContractAddressData | null | undefined;
	tokenStandard: TokenStandard;
	network: Network | undefined;
}): { valid: boolean } => {
	if (tokenStandard !== 'ethereum' || !isNetworkICP(network ?? ETHEREUM_NETWORK)) {
		return { valid: true };
	}

	if (isNullish(helperContractAddress)) {
		toastsError({
			msg: {
				text: `Try again in few seconds, a ckETH configuration parameter is not yet loaded.`
			}
		});
		return { valid: false };
	}

	if (helperContractAddress?.certified !== true) {
		toastsError({
			msg: {
				text: `Try again in few seconds, a ckETH configuration parameter has not yet certified.`
			}
		});
		return { valid: false };
	}

	return { valid: true };
};
