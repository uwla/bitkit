import { SettingsScreenProps } from '../../../navigation/types';
import React, { memo, ReactElement, useEffect, useMemo, useState } from 'react';
import { ScrollView, View as ThemedView } from '../../../styles/components';
import SettingsView from '../SettingsView';
import { Caption13M, Text01M } from '../../../styles/text';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
	BitcoinSlantedIcon,
	BroadcastIcon,
	CloudCheckIcon,
	GlobeSimpleIcon,
	LightningHollow,
} from '../../../styles/icons';
import { IColors } from '../../../styles/colors';
import { useAppSelector } from '../../../hooks/redux';
import {
	isConnectedToElectrumSelector,
	isLDKReadySelector,
	isOnlineSelector,
} from '../../../store/reselect/ui';
import {
	openChannelsSelector,
	pendingChannelsSelector,
} from '../../../store/reselect/lightning';
import { blocktankPaidOrdersFullSelector } from '../../../store/reselect/blocktank';
import { backupSelector } from '../../../store/reselect/backup';
import { i18nTime } from '../../../utils/i18n';
import { FAILED_BACKUP_CHECK_TIME } from '../../../utils/backup/backups-subscriber';

type TStatusItem =
	| 'internet'
	| 'bitcoin_node'
	| 'lightning_node'
	| 'lightning_connection'
	| 'full_backup';

type TItemState = 'ready' | 'pending' | 'error';

interface IStatusItemProps {
	Icon: React.FunctionComponent<any>;
	item: TStatusItem;
	state: TItemState;
	subtitle?: string;
}

const Status = ({
	Icon,
	item,
	state,
	subtitle,
}: IStatusItemProps): ReactElement => {
	const { t } = useTranslation('settings');
	const { bg, fg }: { fg: keyof IColors; bg: keyof IColors } = useMemo(() => {
		switch (state) {
			case 'ready':
				return { bg: 'green16', fg: 'green' };
			case 'pending':
				return { bg: 'yellow16', fg: 'yellow' };
			case 'error':
				return { bg: 'red16', fg: 'red' };
		}
	}, [state]);

	subtitle = subtitle || t(`status.${item}.${state}`);

	return (
		<View style={styles.status} testID={`Status-${item}`}>
			<View style={styles.iconContainer}>
				<ThemedView color={bg} style={styles.icon}>
					<Icon width={16} height={16} color={fg} />
				</ThemedView>
			</View>
			<View style={styles.desc}>
				<Text01M>{t(`status.${item}.title`)}</Text01M>
				<Caption13M color="gray1">{subtitle}</Caption13M>
			</View>
		</View>
	);
};

const AppStatus = ({}: SettingsScreenProps<'AppStatus'>): ReactElement => {
	const { t } = useTranslation('settings');
	const { t: tTime } = useTranslation('intl', { i18n: i18nTime });
	const isOnline = useAppSelector(isOnlineSelector);
	const isConnectedToElectrum = useAppSelector(isConnectedToElectrumSelector);
	const isLDKReady = useAppSelector(isLDKReadySelector);
	const openChannels = useAppSelector(openChannelsSelector);
	const pendingChannels = useAppSelector(pendingChannelsSelector);
	const paidOrders = useAppSelector(blocktankPaidOrdersFullSelector);
	const backup = useAppSelector(backupSelector);
	const [now, setNow] = useState<number>(new Date().getTime());

	const internetState: TItemState = useMemo(() => {
		return isOnline ? 'ready' : 'error';
	}, [isOnline]);

	const bitcoinNodeState: TItemState = useMemo(() => {
		if (isOnline && !isConnectedToElectrum) {
			return 'pending';
		}
		return isConnectedToElectrum ? 'ready' : 'error';
	}, [isConnectedToElectrum, isOnline]);

	const lightningNodeState: TItemState = useMemo(() => {
		return isLDKReady ? 'ready' : 'error';
	}, [isLDKReady]);

	const lightningConnectionState: TItemState = useMemo(() => {
		if (openChannels.length > 0) {
			return 'ready';
		} else if (
			pendingChannels.length > 0 ||
			Object.keys(paidOrders.created).length > 0
		) {
			return 'pending';
		}
		return 'error';
	}, [openChannels, pendingChannels, paidOrders]);

	// Keep checking backup status
	useEffect(() => {
		const timer = setInterval(() => {
			setNow(new Date().getTime());
		}, FAILED_BACKUP_CHECK_TIME);

		return (): void => clearInterval(timer);
	}, []);

	const isBackupSyncOk = useMemo(() => {
		const isSyncOk = (key: number | undefined): boolean => {
			// undefined = no sync required = ok
			return key ? now - key < FAILED_BACKUP_CHECK_TIME : true;
		};

		return (
			isSyncOk(backup.remoteLdkBackupLastSyncRequired) &&
			isSyncOk(backup.remoteLdkActivityBackupSyncRequired) &&
			isSyncOk(backup.remoteBlocktankBackupSyncRequired) &&
			isSyncOk(backup.remoteSettingsBackupSyncRequired) &&
			isSyncOk(backup.remoteMetadataBackupSyncRequired) &&
			isSyncOk(backup.remoteWidgetsBackupSyncRequired)
		);
	}, [backup, now]);

	const fullBackupState: { state: TItemState; subtitle?: string } =
		useMemo(() => {
			if (!isBackupSyncOk) {
				return { state: 'error' };
			}
			const syncTimes = [
				backup.remoteLdkBackupLastSync,
				backup.remoteLdkActivityBackupLastSync,
				backup.remoteBlocktankBackupLastSync,
				backup.remoteSettingsBackupLastSync,
				backup.remoteMetadataBackupLastSync,
				backup.remoteWidgetsBackupLastSync,
			].filter((i) => i !== undefined) as Array<number>;
			const max = Math.max(...syncTimes);
			let subtitle = tTime('dateTime', {
				v: new Date(max),
				formatParams: {
					v: {
						year: 'numeric',
						month: 'long',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
					},
				},
			});
			return { state: 'ready', subtitle };
		}, [tTime, backup, isBackupSyncOk]);

	const items: IStatusItemProps[] = [
		{
			Icon: GlobeSimpleIcon,
			item: 'internet',
			state: internetState,
		},
		{
			Icon: BitcoinSlantedIcon,
			item: 'bitcoin_node',
			state: bitcoinNodeState,
		},
		{
			Icon: BroadcastIcon,
			item: 'lightning_node',
			state: lightningNodeState,
		},
		{
			Icon: LightningHollow,
			item: 'lightning_connection',
			state: lightningConnectionState,
		},
		{
			Icon: CloudCheckIcon,
			item: 'full_backup',
			state: fullBackupState.state,
			subtitle: fullBackupState.subtitle,
		},
	];

	return (
		<ThemedView style={styles.container}>
			<SettingsView
				title={t('status.title')}
				fullHeight={true}
				showBackNavigation={true}>
				<ScrollView style={styles.statusRoot}>
					{items.map((it) => (
						<Status key={it.item} {...it} />
					))}
				</ScrollView>
			</SettingsView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	statusRoot: {
		flex: 1,
	},
	status: {
		marginHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
		height: 56,
		flexDirection: 'row',
		alignItems: 'center',
	},
	iconContainer: {
		marginRight: 16,
		alignItems: 'center',
	},
	icon: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 16,
		width: 32,
		height: 32,
	},
	desc: {
		flex: 1,
	},
});

export default memo(AppStatus);
