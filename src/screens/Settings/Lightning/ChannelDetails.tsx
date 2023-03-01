import React, { ReactElement, memo, useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSelector } from 'react-redux';
import { SvgProps } from 'react-native-svg';
import { IGetOrderResponse } from '@synonymdev/blocktank-client';
import { useTranslation } from 'react-i18next';

import { View as ThemedView } from '../../../styles/components';
import { Caption13Up, Caption13M, Text01M } from '../../../styles/text';
import SafeAreaInsets from '../../../components/SafeAreaInsets';
import Button from '../../../components/Button';
import NavigationHeader from '../../../components/NavigationHeader';
import LightningChannel, {
	TStatus,
} from '../../../components/LightningChannel';
import Money from '../../../components/Money';
import {
	useLightningChannelBalance,
	useLightningChannelName,
} from '../../../hooks/lightning';
import { showSuccessNotification } from '../../../utils/notifications';
import { getTransactions } from '../../../utils/wallet/electrum';
import { getBlockExplorerLink } from '../../../utils/wallet/transactions';
import { openURL } from '../../../utils/helpers';
import { createSupportLink } from '../../../utils/support';
import Store from '../../../store/types';
import {
	selectedNetworkSelector,
	selectedWalletSelector,
} from '../../../store/reselect/wallet';
import { enableDevOptionsSelector } from '../../../store/reselect/settings';
import { openChannelIdsSelector } from '../../../store/reselect/lightning';
import { getStateMessage } from '../../../utils/blocktank';
import {
	ArrowCounterClock,
	Checkmark,
	ClockIcon,
	LightningIcon,
	TimerSpeedIcon,
	XIcon,
} from '../../../styles/icons';
import type { SettingsScreenProps } from '../../../navigation/types';

export const getOrderStatus = (state: number): React.FC<SvgProps> => {
	// possible order states
	// https://github.com/synonymdev/blocktank-server/blob/master/src/Orders/Order.js
	switch (state) {
		case 0:
			return (): ReactElement => (
				<View style={styles.statusRow}>
					<ThemedView color="white1" style={styles.statusIcon}>
						<ClockIcon color="gray1" width={16} height={16} />
					</ThemedView>
					<Text01M>{getStateMessage(state)}</Text01M>
				</View>
			);
		case 100:
			return (): ReactElement => (
				<View style={styles.statusRow}>
					<ThemedView color="white1" style={styles.statusIcon}>
						<Checkmark color="gray1" width={16} height={16} />
					</ThemedView>
					<Text01M>{getStateMessage(state)}</Text01M>
				</View>
			);
		case 150:
			return (): ReactElement => (
				<View style={styles.statusRow}>
					<ThemedView color="white1" style={styles.statusIcon}>
						<ArrowCounterClock color="gray1" width={16} height={16} />
					</ThemedView>
					<Text01M>{getStateMessage(state)}</Text01M>
				</View>
			);
		case 200:
		case 300:
			return (): ReactElement => (
				<View style={styles.statusRow}>
					<ThemedView color="yellow16" style={styles.statusIcon}>
						<ClockIcon color="yellow" width={16} height={16} />
					</ThemedView>
					<Text01M>{getStateMessage(state)}</Text01M>
				</View>
			);
		case 350:
			return (): ReactElement => (
				<View style={styles.statusRow}>
					<ThemedView color="white1" style={styles.statusIcon}>
						<ClockIcon color="gray1" width={16} height={16} />
					</ThemedView>
					<Text01M>{getStateMessage(state)}</Text01M>
				</View>
			);
		case 400:
			return (): ReactElement => (
				<View style={styles.statusRow}>
					<ThemedView color="red16" style={styles.statusIcon}>
						<XIcon color="red" width={16} height={16} />
					</ThemedView>
					<Text01M>{getStateMessage(state)}</Text01M>
				</View>
			);
		case 410:
			return (): ReactElement => (
				<View style={styles.statusRow}>
					<ThemedView color="red16" style={styles.statusIcon}>
						<TimerSpeedIcon color="red" width={16} height={16} />
					</ThemedView>
					<Text01M>{getStateMessage(state)}</Text01M>
				</View>
			);
		case 450:
			return (): ReactElement => (
				<View style={styles.statusRow}>
					<ThemedView color="white1" style={styles.statusIcon}>
						<LightningIcon color="gray1" width={16} height={16} />
					</ThemedView>
					<Text01M>{getStateMessage(state)}</Text01M>
				</View>
			);
		case 500:
			return (): ReactElement => (
				<View style={styles.statusRow}>
					<ThemedView color="green16" style={styles.statusIcon}>
						<LightningIcon color="green" width={16} height={16} />
					</ThemedView>
					<Text01M>{getStateMessage(state)}</Text01M>
				</View>
			);
		default:
			return (): ReactElement => (
				<View style={styles.statusRow}>
					<ThemedView color="white1" style={styles.statusIcon}>
						<LightningIcon color="gray1" width={16} height={16} />
					</ThemedView>
					<Text01M>{getStateMessage(state)}</Text01M>
				</View>
			);
	}
};

const Section = memo(
	({
		name,
		value,
		onPress,
	}: {
		name: string;
		value: ReactElement;
		onPress?: () => void;
	}): ReactElement => {
		return (
			<TouchableOpacity
				activeOpacity={onPress ? 0.5 : 1}
				onPress={onPress}
				style={styles.sectionRoot}>
				<View style={styles.sectionName}>
					<Caption13M>{name}</Caption13M>
				</View>
				<View style={styles.sectionValue}>{value}</View>
			</TouchableOpacity>
		);
	},
);

const ChannelDetails = ({
	navigation,
	route,
}: SettingsScreenProps<'ChannelDetails'>): ReactElement => {
	const { t } = useTranslation('lightning');
	const { channel } = route.params;

	const name = useLightningChannelName(channel);
	const { spendingAvailable, receivingAvailable, capacity } =
		useLightningChannelBalance(channel);
	const selectedWallet = useSelector(selectedWalletSelector);
	const selectedNetwork = useSelector(selectedNetworkSelector);
	const enableDevOptions = useSelector(enableDevOptionsSelector);
	const [txTime, setTxTime] = useState<undefined | string>();

	const blocktankOrders = useSelector((state: Store) => {
		return state.blocktank.orders;
	});

	const blocktankOrder = Object.values(blocktankOrders).find((order) => {
		return order.channel_open_tx?.transaction_id === channel.funding_txid;
	});

	const openChannelIds = useSelector((state: Store) => {
		return openChannelIdsSelector(state, selectedWallet, selectedNetwork);
	});

	// TODO: show status for non-blocktank channels
	const Status = useMemo(() => {
		if (blocktankOrder) {
			return getOrderStatus(blocktankOrder.state);
		}

		return null;
	}, [blocktankOrder]);

	useEffect(() => {
		if (!channel.funding_txid) {
			return;
		}
		getTransactions({
			txHashes: [{ tx_hash: channel.funding_txid }],
			selectedNetwork,
		}).then((txResponse) => {
			if (txResponse.isErr()) {
				return;
			}
			const txData = txResponse.value.data;
			if (txData.length === 0) {
				return;
			}
			const timestamp = txData[0].result.time;
			if (!timestamp) {
				return;
			}

			const formattedDate = t('intl:dateTime', {
				v: new Date(timestamp * 1000),
				formatParams: {
					v: {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
						hour12: false,
					},
				},
			});

			setTxTime(formattedDate);
		});
	}, [selectedNetwork, channel.funding_txid, t]);

	const openSupportLink = async (order: IGetOrderResponse): Promise<void> => {
		await openURL(
			await createSupportLink(
				order._id,
				`Transaction ID: ${order.channel_open_tx?.transaction_id}`,
			),
		);
	};

	const getChannelStatus = (): TStatus => {
		if (blocktankOrder) {
			if ([0, 100, 150, 200].includes(blocktankOrder.state)) {
				return 'pending';
			}
			if ([400, 410].includes(blocktankOrder.state)) {
				return 'closed';
			}
		}

		if (openChannelIds.includes(channel.channel_id)) {
			return 'pending';
		}

		if (channel.is_channel_ready) {
			return channel.is_usable ? 'open' : 'pending';
		} else {
			return 'closed';
		}
	};

	return (
		<ThemedView style={styles.root}>
			<SafeAreaInsets type="top" />
			<NavigationHeader
				title={name}
				onClosePress={(): void => {
					navigation.navigate('Wallet');
				}}
			/>
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.channel}>
					<LightningChannel channel={channel} status={getChannelStatus()} />
				</View>

				{blocktankOrder && (
					<View style={styles.status}>
						<View style={styles.sectionTitle}>
							<Caption13Up color="gray1">{t('status')}</Caption13Up>
						</View>
						{Status && <Status />}
					</View>
				)}

				{blocktankOrder && (
					<View style={styles.section}>
						<View style={styles.sectionTitle}>
							<Caption13Up color="gray1">{t('order_details')}</Caption13Up>
						</View>
						<Section
							name={t('order')}
							value={<Caption13M>{blocktankOrder._id}</Caption13M>}
						/>
						<Section
							name={t('created_on')}
							value={
								<Caption13M>
									{t('intl:dateTime', {
										v: new Date(blocktankOrder.created_at),
										formatParams: {
											v: {
												year: 'numeric',
												month: 'short',
												day: 'numeric',
												hour: 'numeric',
												minute: 'numeric',
												hour12: false,
											},
										},
									})}
								</Caption13M>
							}
						/>
						{channel.funding_txid && (
							<Section
								name={t('transaction')}
								value={
									<Caption13M ellipsizeMode="middle" numberOfLines={1}>
										{channel.funding_txid}
									</Caption13M>
								}
								onPress={(): void => {
									if (channel.funding_txid) {
										const blockExplorerUrl = getBlockExplorerLink(
											channel.funding_txid,
										);
										Clipboard.setString(channel.funding_txid);
										openURL(blockExplorerUrl).then();
									}
								}}
							/>
						)}
						<Section
							name={t('order_fee')}
							value={
								<Money
									sats={blocktankOrder.price}
									size="caption13M"
									symbol={true}
									color="white"
									unit="satoshi"
								/>
							}
						/>
					</View>
				)}

				<View style={styles.section}>
					<View style={styles.sectionTitle}>
						<Caption13Up color="gray1">{t('balance')}</Caption13Up>
					</View>
					<Section
						name={t('receiving_label')}
						value={
							<Money
								sats={receivingAvailable}
								size="caption13M"
								symbol={true}
								color="white"
								unit="satoshi"
							/>
						}
					/>
					<Section
						name={t('spending_label')}
						value={
							<Money
								sats={spendingAvailable}
								size="caption13M"
								symbol={true}
								color="white"
								unit="satoshi"
							/>
						}
					/>
					<Section
						name={t('reserve_balance')}
						value={
							<Money
								sats={Number(channel.unspendable_punishment_reserve)}
								size="caption13M"
								symbol={true}
								color="white"
								unit="satoshi"
							/>
						}
					/>
					<Section
						name={t('total_size')}
						value={
							<Money
								sats={capacity}
								size="caption13M"
								symbol={true}
								color="white"
								unit="satoshi"
							/>
						}
					/>
				</View>

				{/* TODO: show fees */}
				{/* <View style={styles.section}>
					<View style={styles.sectionTitle}>
						<Caption13Up color="gray1">Fees</Caption13Up>
					</View>
					<Section
						name="Spending base fee"
						value={
							<Money
								sats={123}
								size="caption13M"
								symbol={true}
								color="white"
								unit="satoshi"
							/>
						}
					/>
					<Section
						name="Receiving base fee"
						value={
							<Money
								sats={123}
								size="caption13M"
								symbol={true}
								color="white"
								unit="satoshi"
							/>
						}
					/>
				</View> */}

				<View style={styles.section}>
					<View style={styles.sectionTitle}>
						<Caption13Up color="gray1">{t('other')}</Caption13Up>
					</View>
					{txTime && (
						<Section
							name={t('opened_on')}
							value={<Caption13M>{txTime}</Caption13M>}
						/>
					)}
					<Section
						name={t('node_id')}
						value={
							<Caption13M ellipsizeMode="middle" numberOfLines={1}>
								{channel.counterparty_node_id}
							</Caption13M>
						}
						onPress={(): void => {
							Clipboard.setString(channel.counterparty_node_id);
							showSuccessNotification({
								title: t('copied_couterparty'),
								message: channel.counterparty_node_id,
							});
						}}
					/>
				</View>

				{enableDevOptions && (
					<View style={styles.section}>
						<View style={styles.sectionTitle}>
							<Caption13Up color="gray1">{t('debug')}</Caption13Up>
						</View>
						<Section
							name={t('is_usable')}
							value={
								<Caption13M>{t(channel.is_usable ? 'yes' : 'no')}</Caption13M>
							}
						/>
						<Section
							name={t('is_ready')}
							value={
								<Caption13M>
									{t(channel.is_channel_ready ? 'yes' : 'no')}
								</Caption13M>
							}
						/>
					</View>
				)}

				<View style={styles.buttons}>
					{blocktankOrder && (
						<>
							<Button
								style={styles.button}
								text={t('support')}
								size="large"
								variant="secondary"
								onPress={(): void => {
									openSupportLink(blocktankOrder);
								}}
							/>
							<View style={styles.divider} />
						</>
					)}
					<Button
						style={styles.button}
						text={t('close_conn')}
						size="large"
						onPress={(): void =>
							navigation.navigate('CloseConnection', {
								channelId: channel.channel_id,
							})
						}
					/>
				</View>

				<SafeAreaInsets type="bottom" />
			</ScrollView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		justifyContent: 'space-between',
	},
	content: {
		paddingHorizontal: 16,
		flexGrow: 1,
	},
	channel: {
		paddingTop: 16,
		paddingBottom: 32,
		marginBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
	},
	status: {
		marginBottom: 16,
	},
	statusRow: {
		marginTop: 8,
		flexDirection: 'row',
		alignItems: 'center',
	},
	statusIcon: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 32,
		height: 32,
		borderRadius: 16,
		marginRight: 16,
	},
	section: {
		marginTop: 16,
	},
	sectionTitle: {
		height: 30,
		flexDirection: 'row',
		alignItems: 'center',
	},
	sectionRoot: {
		height: 50,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
	},
	sectionName: {
		flex: 1,
	},
	sectionValue: {
		flex: 1.5,
		alignItems: 'flex-end',
		justifyContent: 'center',
	},
	buttons: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 'auto',
	},
	button: {
		marginTop: 16,
		paddingHorizontal: 16,
		flex: 1,
	},
	divider: {
		width: 16,
	},
});

export default memo(ChannelDetails);
