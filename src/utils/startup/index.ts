import { InteractionManager } from 'react-native';
import { err, ok, Result } from '@synonymdev/result';

import {
	generateMnemonic,
	getBip39Passphrase,
	getMnemonicPhrase,
	getSelectedAddressType,
	getSelectedNetwork,
	getSelectedWallet,
	refreshWallet,
	setupOnChainWallet,
} from '../wallet';
import { createWallet } from '../../store/actions/wallet';
import { getWalletStore } from '../../store/helpers';
import { refreshBlocktankInfo } from '../../store/utils/blocktank';
import { keepLdkSynced, setupLdk } from '../lightning';
import { setupBlocktank, watchPendingOrders } from '../blocktank';
import { updateSlashPayConfig2 } from '../slashtags2';
import { Slashtag } from '../../hooks/slashtags';
import { performFullRestoreFromLatestBackup } from '../../store/utils/backup';
import { promiseTimeout } from '../helpers';
import { EAvailableNetwork } from '../networks';
import { TWalletName } from '../../store/types/wallet';
import { runChecks } from '../wallet/checks';

/**
 * Creates a new wallet from scratch
 * @returns {Promise<Result<string>>}
 */
export const createNewWallet = async ({
	bip39Passphrase,
}: {
	bip39Passphrase?: string;
} = {}): Promise<Result<string>> => {
	const mnemonic = await generateMnemonic();
	if (!mnemonic) {
		return err('Unable to generate mnemonic.');
	}
	const createRes = await createWallet({ mnemonic, bip39Passphrase });
	if (createRes.isErr()) {
		return err(createRes.error.message);
	}
	return ok('Wallet created');
};

export const restoreSeed = async ({
	mnemonic,
	bip39Passphrase,
	selectedNetwork = getSelectedNetwork(),
}: {
	mnemonic: string;
	bip39Passphrase?: string;
	selectedNetwork?: EAvailableNetwork;
}): Promise<Result<string>> => {
	const res = await createWallet({
		mnemonic,
		bip39Passphrase,
		restore: true,
		selectedNetwork,
	});
	if (res.isErr()) {
		return res;
	}
	const setupRes = await setupOnChainWallet({
		name: getSelectedWallet(),
		selectedNetwork,
		mnemonic,
		bip39Passphrase,
	});
	if (setupRes.isErr()) {
		return err(setupRes.error.message);
	}
	return ok('Seed restored');
};

export const restoreRemoteBackups = async (
	slashtag: Slashtag,
): Promise<Result<string>> => {
	const res = await performFullRestoreFromLatestBackup(slashtag);
	if (res.isErr()) {
		return err(res.error);
	}
	return ok('Remote Backups Restored');
};

/**
 * Starts all wallet services
 * @returns {Promise<Result<string>>}
 */
const ENABLE_SERVICES = true;
export const startWalletServices = async ({
	onchain = ENABLE_SERVICES,
	lightning = ENABLE_SERVICES,
	restore = false,
	staleBackupRecoveryMode = false,
	selectedWallet,
	selectedNetwork,
}: {
	onchain?: boolean;
	lightning?: boolean;
	restore?: boolean;
	staleBackupRecoveryMode?: boolean;
	selectedWallet?: TWalletName;
	selectedNetwork?: EAvailableNetwork;
}): Promise<Result<string>> => {
	try {
		// wait for interactions/animations to be completed
		await new Promise((resolve) => {
			InteractionManager.runAfterInteractions(() => resolve(null));
		});
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}

		await promiseTimeout(2500, setupBlocktank(selectedNetwork));
		await promiseTimeout(2500, refreshBlocktankInfo());

		const mnemonicResponse = await getMnemonicPhrase();
		if (mnemonicResponse.isErr()) {
			return err(mnemonicResponse.error.message);
		}
		const mnemonic = mnemonicResponse.value;

		const walletExists = getWalletStore()?.walletExists;
		if (!walletExists) {
			const bip39Passphrase = await getBip39Passphrase();
			const createRes = await createWallet({ mnemonic, bip39Passphrase });
			if (createRes.isErr()) {
				return err(createRes.error.message);
			}
		} else {
			const onChainSetupRes = await setupOnChainWallet({
				name: selectedWallet,
				selectedNetwork,
				bip39Passphrase: await getBip39Passphrase(),
				addressType: getSelectedAddressType({
					selectedWallet,
					selectedNetwork,
				}),
			});
			if (onChainSetupRes.isErr()) {
				return err(onChainSetupRes.error.message);
			}
		}

		// Setup LDK
		if (lightning) {
			const setupResponse = await setupLdk({
				selectedNetwork,
				shouldRefreshLdk: false,
				staleBackupRecoveryMode,
				shouldPreemptivelyStopLdk: false,
			});
			if (setupResponse.isOk()) {
				keepLdkSynced({ selectedNetwork }).then();
			}
		}

		if (onchain || lightning) {
			await Promise.all([
				// if we restore wallet, we need to generate addresses for all types
				refreshWallet({
					onchain: restore,
					lightning,
					scanAllAddresses: restore,
					updateAllAddressTypes: true, // Ensure we scan all address types when spinning up the app.
					showNotification: !restore,
				}),
			]);
			await runChecks({ selectedWallet, selectedNetwork });
		}

		if (lightning) {
			watchPendingOrders();
		}

		// Refresh slashpay config
		updateSlashPayConfig2({ selectedNetwork, forceUpdate: true });

		return ok('Wallet started');
	} catch (e) {
		return err(e);
	}
};
