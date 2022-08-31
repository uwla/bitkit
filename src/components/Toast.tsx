import React, { ReactElement } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import { BlurView } from '@react-native-community/blur';

import colors from '../styles/colors';
import { Text01M, Text13S } from '../styles/components';
import ToastGradient from '../components/HorizontalGradient';

const Toast = ({
	type,
	text1,
	text2,
}: ToastConfigParams<any>): ReactElement => {
	const dimensions = useWindowDimensions();

	let titleColor = 'white';
	let gradientColor = colors.black;

	if (type === 'success') {
		titleColor = 'green';
		gradientColor = '#1d2f1c';
	}

	if (type === 'info') {
		titleColor = 'blue';
		gradientColor = '#00294e';
	}

	if (type === 'error') {
		titleColor = 'brand';
		gradientColor = '#411a00';
	}

	return (
		<View style={[{ width: dimensions.width - 16 * 2 }, styles.container]}>
			<BlurView style={styles.blur} />
			<ToastGradient style={styles.gradient} color={gradientColor} />
			<Text01M color={titleColor}>{text1}</Text01M>
			<Text13S style={styles.description} color="gray1">
				{text2}
			</Text13S>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 8,
		padding: 16,
		position: 'relative',
		overflow: 'hidden',
	},
	blur: {
		...StyleSheet.absoluteFillObject,
		padding: 16,
	},
	gradient: {
		...StyleSheet.absoluteFillObject,
	},
	description: {
		marginTop: 3,
	},
});

export const toastConfig: ToastConfig = {
	success: (props) => <Toast {...props} />,
	info: (props) => <Toast {...props} />,
	error: (props) => <Toast {...props} />,
};
