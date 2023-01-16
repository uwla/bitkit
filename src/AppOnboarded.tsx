import React, { memo, ReactElement, useEffect, useRef } from 'react';
import { Platform, NativeModules, AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import RootNavigator from './navigation/root/RootNavigator';
import { useSlashtagsSDK } from './components/SlashtagsProvider';
import { updateUi } from './store/actions/ui';
import { useAppSelector } from './hooks/redux';
import { useBalance } from './hooks/wallet';
import { startWalletServices } from './utils/startup';
import { electrumConnection } from './utils/electrum';
import { readClipboardInvoice } from './utils/send';
import { unsubscribeFromLightningSubscriptions } from './utils/lightning';
import { enableAutoReadClipboardSelector } from './store/reselect/settings';
import {
	showErrorNotification,
	showSuccessNotification,
} from './utils/notifications';
import {
	selectedNetworkSelector,
	selectedWalletSelector,
} from './store/reselect/wallet';
import {
	isConnectedToElectrumSelector,
	isOnlineSelector,
} from './store/reselect/ui';

const AppOnboarded = (): ReactElement => {
	const appState = useRef(AppState.currentState);
	const sdk = useSlashtagsSDK();
	const { satoshis: onChainBalance } = useBalance({ onchain: true });
	const { satoshis: lightningBalance } = useBalance({ lightning: true });
	const enableAutoReadClipboard = useAppSelector(
		enableAutoReadClipboardSelector,
	);
	const selectedWallet = useAppSelector(selectedWalletSelector);
	const selectedNetwork = useAppSelector(selectedNetworkSelector);
	const isOnline = useAppSelector(isOnlineSelector);
	const isConnectedToElectrum = useAppSelector(isConnectedToElectrumSelector);

	// on App start
	useEffect(() => {
		// hide splash screen on android
		if (Platform.OS === 'android') {
			setTimeout(NativeModules.SplashScreenModule.hide, 100);
		}

		// launch wallet services
		(async (): Promise<void> => {
			await startWalletServices({ selectedNetwork, selectedWallet });

			// check clipboard for payment data
			if (enableAutoReadClipboard) {
				// hack to wait for BottomSheet to be ready(?)
				setTimeout(() => {
					readClipboardInvoice({
						onChainBalance,
						lightningBalance,
						sdk,
						selectedWallet,
						selectedNetwork,
					});
				}, 100);
			}
		})();

		return () => {
			unsubscribeFromLightningSubscriptions();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// on AppState change
	useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextAppState) => {
			// on App to foreground
			if (
				appState.current.match(/inactive|background/) &&
				nextAppState === 'active'
			) {
				// App came back to foreground

				// check clipboard for payment data
				if (enableAutoReadClipboard) {
					// timeout needed otherwise clipboard is empty
					setTimeout(() => {
						readClipboardInvoice({
							onChainBalance,
							lightningBalance,
							sdk,
							selectedNetwork,
							selectedWallet,
						}).then();
					}, 1000);
				}
			}

			// on App to background
			/*if (appState.current === 'active' && nextAppState === 'background') {
				// do something when the app goes to background
				//resetLdk().then();
			}*/

			appState.current = nextAppState;
		});

		return () => {
			subscription.remove();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const unsubscribeElectrum = electrumConnection.subscribe((isConnected) => {
			if (!isConnectedToElectrum && isConnected) {
				updateUi({ isConnectedToElectrum: isConnected });
				// showSuccessNotification({
				// 	title: 'Bitkit Connection Restored',
				// 	message: 'Successfully reconnected to Electrum Server.',
				// });
			}

			if (isConnectedToElectrum && !isConnected) {
				updateUi({ isConnectedToElectrum: isConnected });
				// showErrorNotification({
				// 	title: 'Bitkit Is Reconnecting',
				// 	message: 'Lost connection to server, trying to reconnect...',
				// });
			}
		});

		return () => {
			unsubscribeElectrum();
		};
	}, [isConnectedToElectrum]);

	useEffect(() => {
		// subscribe to connection information
		const unsubscribeNetInfo = NetInfo.addEventListener(({ isConnected }) => {
			if (isConnected) {
				// prevent toast from showing on startup
				if (isOnline !== isConnected) {
					showSuccessNotification({
						title: 'You’re Back Online!',
						message: 'Successfully reconnected to the Internet.',
					});
				}
				updateUi({ isOnline: true });
			} else {
				showErrorNotification({
					title: 'Internet Connectivity Issues',
					message: 'Please check your network connection.',
				});
				updateUi({ isOnline: false });
			}
		});

		return () => {
			unsubscribeNetInfo();
		};
	}, [isOnline]);

	return <RootNavigator />;
};

export default memo(AppOnboarded);
