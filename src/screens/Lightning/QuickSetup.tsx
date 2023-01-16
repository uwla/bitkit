import React, {
	ReactElement,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { FadeIn, FadeOut } from 'react-native-reanimated';

import { AnimatedView } from '../../styles/components';
import { Caption13Up, Display, Text01S } from '../../styles/text';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import GlowingBackground from '../../components/GlowingBackground';
import NavigationHeader from '../../components/NavigationHeader';
import Percentage from '../../components/Percentage';
import Button from '../../components/Button';
import AmountToggle from '../../components/AmountToggle';
import FancySlider from '../../components/FancySlider';
import NumberPadLightning from './NumberPadLightning';
import { useBalance } from '../../hooks/wallet';
import {
	resetOnChainTransaction,
	setupOnChainTransaction,
} from '../../store/actions/wallet';
import { startChannelPurchase } from '../../store/actions/blocktank';
import { showErrorNotification } from '../../utils/notifications';
import { fiatToBitcoinUnit } from '../../utils/exchange-rate';
import { convertCurrency } from '../../utils/blocktank';
import { SPENDING_LIMIT_RATIO } from '../../utils/wallet/constants';
import type { LightningScreenProps } from '../../navigation/types';
import {
	selectedNetworkSelector,
	selectedWalletSelector,
} from '../../store/reselect/wallet';
import { blocktankServiceSelector } from '../../store/reselect/blocktank';
import { selectedCurrencySelector } from '../../store/reselect/settings';
import { EBitcoinUnit } from '../../store/types/wallet';

const QuickSetup = ({
	navigation,
}: LightningScreenProps<'QuickSetup'>): ReactElement => {
	const [keybrd, setKeybrd] = useState(false);
	const [loading, setLoading] = useState(false);
	const [totalBalance, setTotalBalance] = useState(0);
	const [spendingAmount, setSpendingAmount] = useState(0);
	const currentBalance = useBalance({ onchain: true });
	const selectedNetwork = useSelector(selectedNetworkSelector);
	const selectedWallet = useSelector(selectedWalletSelector);
	const blocktankService = useSelector(blocktankServiceSelector);
	const selectedCurrency = useSelector(selectedCurrencySelector);

	const savingsAmount = totalBalance - spendingAmount;
	const spendingPercentage = Math.round((spendingAmount / totalBalance) * 100);
	const savingsPercentage = Math.round((savingsAmount / totalBalance) * 100);

	const handleChange = useCallback((v: number) => {
		setSpendingAmount(Math.round(v));
	}, []);

	const spendingLimit = useMemo(() => {
		const spendableBalance = Math.round(
			currentBalance.satoshis / SPENDING_LIMIT_RATIO,
		);
		const convertedUnit = convertCurrency({
			amount: 999,
			from: 'USD',
			to: selectedCurrency,
		});
		const maxSpendingLimit =
			fiatToBitcoinUnit({
				fiatValue: convertedUnit.fiatValue,
				bitcoinUnit: EBitcoinUnit.satoshi,
			}) ?? 0;
		if (!maxSpendingLimit) {
			return spendableBalance;
		}
		return Math.min(spendableBalance, maxSpendingLimit);
	}, [currentBalance.satoshis, selectedCurrency]);

	useEffect(() => {
		setTotalBalance(spendingLimit);
	}, [
		blocktankService?.max_chan_spending,
		currentBalance.satoshis,
		spendingLimit,
	]);

	// default spendingPercentage to 20%
	useEffect(() => {
		return setSpendingAmount(Math.round(totalBalance * 0.2));
	}, [totalBalance]);

	useFocusEffect(
		useCallback(() => {
			resetOnChainTransaction({ selectedNetwork, selectedWallet });
			setupOnChainTransaction({
				selectedNetwork,
				selectedWallet,
			}).then();
		}, [selectedNetwork, selectedWallet]),
	);

	const onContinuePress = useCallback(async (): Promise<void> => {
		setLoading(true);
		const localBalance =
			Math.round(spendingAmount * 1.1) > blocktankService.min_channel_size
				? Math.round(spendingAmount * 1.1)
				: blocktankService.min_channel_size;
		const purchaseResponse = await startChannelPurchase({
			selectedNetwork,
			selectedWallet,
			productId: blocktankService.product_id,
			remoteBalance: spendingAmount,
			localBalance,
			channelExpiry: 12,
		});

		if (purchaseResponse.isErr()) {
			showErrorNotification({
				title: 'Channel Purchase Error',
				message: purchaseResponse.error.message,
			});
			setLoading(false);
			return;
		}
		setLoading(false);
		navigation.push('QuickConfirm', {
			spendingAmount,
			total: totalBalance,
			orderId: purchaseResponse.value,
		});
	}, [
		blocktankService,
		navigation,
		selectedNetwork,
		selectedWallet,
		spendingAmount,
		totalBalance,
	]);

	return (
		<GlowingBackground topLeft="purple">
			<SafeAreaInsets type="top" />
			<NavigationHeader
				title="Add Instant Payments"
				onClosePress={(): void => {
					navigation.navigate('Wallet');
				}}
			/>
			<View style={styles.root}>
				<View>
					{keybrd ? (
						<Display color="purple">Spending{'\n'}Money.</Display>
					) : (
						<Display color="purple">Spending{'\n'}Balance.</Display>
					)}
					{keybrd ? (
						<Text01S color="gray1" style={styles.text}>
							Enter the amount of money you want to be able to spend instantly.
						</Text01S>
					) : (
						<Text01S color="gray1" style={styles.text}>
							Choose how much bitcoin you want to be able to spend instantly and
							how much you want to keep in savings.
						</Text01S>
					)}
				</View>

				{!keybrd && (
					<>
						<View style={styles.grow1} />
						<AnimatedView
							color="transparent"
							entering={FadeIn}
							exiting={FadeOut}>
							<View style={styles.row}>
								<Caption13Up color="purple">SPENDING</Caption13Up>
								<Caption13Up color="orange">SAVINGS</Caption13Up>
							</View>
							<View style={styles.sliderContainer}>
								<FancySlider
									minimumValue={0}
									maximumValue={totalBalance}
									value={spendingAmount}
									onValueChange={handleChange}
								/>
							</View>
							<View style={styles.row}>
								<Percentage value={spendingPercentage} type="spending" />
								<Percentage value={savingsPercentage} type="savings" />
							</View>
						</AnimatedView>
						<View style={styles.grow2} />
					</>
				)}

				<View>
					<View style={styles.amountBig}>
						<View>
							{!keybrd && (
								<Caption13Up color="purple" style={styles.amountBigCaption}>
									SPENDING BALANCE
								</Caption13Up>
							)}
							<AmountToggle
								sats={spendingAmount}
								unit="fiat"
								onPress={(): void => setKeybrd(true)}
							/>
						</View>
					</View>

					{!keybrd && (
						<AnimatedView
							color="transparent"
							entering={FadeIn}
							exiting={FadeOut}>
							<Button
								loading={loading}
								text="Continue"
								size="large"
								onPress={onContinuePress}
							/>
							<SafeAreaInsets type="bottom" />
						</AnimatedView>
					)}
				</View>

				{keybrd && (
					<NumberPadLightning
						sats={spendingAmount}
						onChange={setSpendingAmount}
						onMaxPress={(): void => {
							setSpendingAmount(totalBalance);
						}}
						onDone={(): void => {
							if (spendingAmount > totalBalance) {
								setSpendingAmount(totalBalance);
							}
							setKeybrd(false);
						}}
						style={styles.numberpad}
					/>
				)}
			</View>
		</GlowingBackground>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		justifyContent: 'space-between',
		marginTop: 8,
		marginBottom: 16,
		paddingHorizontal: 16,
	},
	text: {
		marginTop: 8,
		marginBottom: 8,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginVertical: 4,
	},
	sliderContainer: {
		marginTop: 24,
		marginBottom: 16,
	},
	amountBig: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 32,
	},
	amountBigCaption: {
		marginBottom: 4,
	},
	numberpad: {
		marginHorizontal: -16,
	},
	grow1: {
		flexGrow: 1,
	},
	grow2: {
		flexGrow: 2,
	},
});

export default QuickSetup;
