import { getAirdropCode, redeemAirdropCode } from '$airdrop/api/airdrop.api';
import { airdropCode } from '$airdrop/derived/airdrop.derived';
import { airdropStore } from '$airdrop/stores/airdrop.store';
import { authStore } from '$lib/stores/auth.store';
import { toastsError } from '$lib/stores/toasts.store';
import { nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const initAirdrop = (): Promise<{ success: boolean }> => {
	const code = get(airdropCode);

	if (nonNullish(code)) {
		return redeemCode(code);
	}

	return loadAirdrop();
};

const redeemCode = async (code: string): Promise<{ success: boolean }> => {
	try {
		const { identity } = get(authStore);

		const result = await redeemAirdropCode({ code, identity });

		if ('Err' in result) {
			const { Err } = result;

			if ('CannotRegisterMultipleTimes' in Err) {
				// We ignore this error, user might have just clicked "Refresh" in the browser, and proceed further by loading the code.
				return await loadAirdrop();
			}

			throw Error(JSON.stringify(Err));
		}

		const { Ok } = result;

		airdropStore.set(Ok);
	} catch (err: unknown) {
		airdropStore.reset();

		toastsError({
			msg: { text: 'Error while redeeming the airdrop code.' },
			err
		});

		return { success: false };
	}

	return { success: true };
};

const loadAirdrop = async (): Promise<{ success: boolean }> => {
	try {
		const { identity } = get(authStore);

		const result = await getAirdropCode(identity);

		if ('Err' in result) {
			const { Err } = result;

			if ('CodeNotFound' in Err) {
				airdropStore.set(null);

				return { success: true };
			}

			throw Error(JSON.stringify(Err));
		}

		const { Ok } = result;

		airdropStore.set(Ok);
	} catch (err: unknown) {
		airdropStore.reset();

		toastsError({
			msg: { text: 'Error while loading the airdrop code.' },
			err
		});

		return { success: false };
	}

	return { success: true };
};
