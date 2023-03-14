import React, { ReactElement, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';

import { Display, Text01B, Text01S } from '../../styles/text';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import GlowingBackground from '../../components/GlowingBackground';
import NavigationHeader from '../../components/NavigationHeader';
import GlowImage from '../../components/GlowImage';
import Button from '../../components/Button';
import { refreshWallet } from '../../utils/wallet';
import { closeAllChannels } from '../../utils/lightning';
import { startCoopCloseTimer } from '../../store/actions/user';
import { addTodo, removeTodo } from '../../store/actions/todos';
import type { TransferScreenProps } from '../../navigation/types';
import {
	selectedNetworkSelector,
	selectedWalletSelector,
} from '../../store/reselect/wallet';

const imageSrc = require('../../assets/illustrations/exclamation-mark.png');

const Availability = ({
	navigation,
}: TransferScreenProps<'Availability'>): ReactElement => {
	const { t } = useTranslation('lightning');
	const selectedWallet = useSelector(selectedWalletSelector);
	const selectedNetwork = useSelector(selectedNetworkSelector);

	const onCancel = (): void => {
		navigation.goBack();
	};

	const onContinue = async (): Promise<void> => {
		const closeResponse = await closeAllChannels({
			selectedNetwork,
			selectedWallet,
		});

		removeTodo('transfer');

		if (closeResponse.isOk() && closeResponse.value.length === 0) {
			addTodo('transferToSavings');
			await refreshWallet();
			navigation.navigate('Success', { type: 'savings' });
			return;
		} else {
			startCoopCloseTimer();
			addTodo('transferClosingChannel');
			navigation.navigate('Interrupted');
		}
	};

	return (
		<GlowingBackground topLeft="purple">
			<SafeAreaInsets type="top" />
			<NavigationHeader
				title={t('availability_title')}
				displayBackButton={false}
			/>
			<View style={styles.root}>
				<Display color="purple">{t('availability_header')}</Display>
				<Text01S color="gray1" style={styles.text}>
					<Trans
						t={t}
						i18nKey="availability_text"
						components={{
							purple: <Text01B color="purple" />,
						}}
					/>
				</Text01S>

				<GlowImage image={imageSrc} glowColor="purple" />

				<View style={styles.buttonContainer}>
					<Button
						style={styles.button}
						text={t('cancel')}
						size="large"
						variant="secondary"
						onPress={onCancel}
					/>
					<View style={styles.divider} />
					<Button
						style={styles.button}
						text={t('ok')}
						size="large"
						onPress={onContinue}
					/>
				</View>
			</View>
			<SafeAreaInsets type="bottom" />
		</GlowingBackground>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		marginTop: 8,
		paddingHorizontal: 16,
	},
	text: {
		marginTop: 8,
		marginBottom: 16,
	},
	buttonContainer: {
		marginTop: 'auto',
		marginBottom: 16,
		flexDirection: 'row',
		justifyContent: 'center',
	},
	button: {
		flex: 1,
	},
	divider: {
		width: 16,
	},
});

export default memo(Availability);
