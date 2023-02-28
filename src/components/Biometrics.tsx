import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import rnBiometrics from 'react-native-biometrics';

import { View, TouchableOpacity } from '../styles/components';
import { Subtitle } from '../styles/text';
import { Ionicons } from '../styles/icons';
import { updateSettings } from '../store/actions/settings';
import { vibrate } from '../utils/helpers';

const getIcon = ({
	biometryData,
}: {
	biometryData?: IsSensorAvailableResult;
}): ReactElement => {
	try {
		if (!biometryData?.available) {
			return <View />;
		}
		const biometryType = biometryData?.biometryType;
		if (biometryType === 'TouchID' || biometryType === 'Biometrics') {
			return <Ionicons name="ios-finger-print" size={65} />;
		}

		return <></>;
	} catch {
		return <></>;
	}
};

export type BiometryType = 'TouchID' | 'FaceID' | 'Biometrics';
export interface IsSensorAvailableResult {
	available: boolean;
	biometryType?: BiometryType;
	error?: string;
}

interface BiometricsComponent {
	onSuccess: () => void;
	onFailure?: () => void;
	style?: StyleProp<ViewStyle>;
	children?: ReactElement;
}
const Biometrics = ({
	onSuccess,
	onFailure,
	style,
	children,
}: BiometricsComponent): ReactElement => {
	const insets = useSafeAreaInsets();
	const [biometryData, setBiometricData] = useState<IsSensorAvailableResult>();

	useEffect(() => {
		(async (): Promise<void> => {
			const data = await rnBiometrics.isSensorAvailable();
			setBiometricData(data);
			authenticate(`Confirm ${data.biometryType || 'Biometrics'}`);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const Icon = useCallback(
		() => getIcon({ biometryData }),
		//eslint-disable-next-line react-hooks/exhaustive-deps
		[biometryData?.biometryType],
	);

	const getText = useCallback((): string => {
		try {
			if (!biometryData?.available || !biometryData?.biometryType) {
				return '';
			}
			if (biometryData?.biometryType === 'FaceID') {
				return '';
			}
			if (biometryData?.available && biometryData?.biometryType) {
				return `Authenticate with ${biometryData.biometryType}`;
			}
			return 'It appears that your device does not support Biometric security.';
		} catch {
			return 'It appears that your device does not support Biometric security.';
		}
	}, [biometryData?.available, biometryData?.biometryType]);

	const authenticate = useCallback(
		(promptMessage?: string): void => {
			try {
				if (!promptMessage) {
					const biotmetryType = biometryData?.biometryType;
					promptMessage = `Confirm ${biotmetryType}`;
				}
				rnBiometrics
					.simplePrompt({
						promptMessage: promptMessage || '',
						cancelButtonText: 'Use PIN code',
					})
					.then(({ success }) => {
						if (success) {
							updateSettings({ biometrics: true });
							onSuccess();
						} else {
							vibrate();
							onFailure?.();
						}
					})
					.catch(() => {
						console.log('biometrics failed');
						onFailure?.();
					});
			} catch {}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[biometryData?.biometryType],
	);

	return (
		<View color="transparent" style={[styles.container, style]}>
			<TouchableOpacity
				style={[styles.container, { paddingBottom: insets.bottom + 120 }]}
				color="transparent"
				activeOpacity={0.6}
				onPress={(): void => authenticate()}
				testID="Biometrics">
				<Icon />
				<Subtitle style={styles.text}>{getText()}</Subtitle>
			</TouchableOpacity>
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 20,
	},
	text: {
		marginTop: 16,
		textAlign: 'center',
	},
});

export default memo(Biometrics);
