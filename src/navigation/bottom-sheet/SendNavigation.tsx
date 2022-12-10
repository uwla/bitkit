import React, { ReactElement, memo } from 'react';
import {
	createNativeStackNavigator,
	NativeStackNavigationOptions,
	NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import AddressAndAmount from '../../screens/Wallets/Send/AddressAndAmount';
import FeeRate from '../../screens/Wallets/Send/FeeRate';
import FeeCustom from '../../screens/Wallets/Send/FeeCustom';
import Tags from '../../screens/Wallets/Send/Tags';
import ReviewAndSend from '../../screens/Wallets/Send/ReviewAndSend';
import AutoRebalance from '../../screens/Wallets/Send/AutoRebalance';
import Result from '../../screens/Wallets/Send/Result';
import Scanner from '../../screens/Wallets/Send/Scanner';
import Contacts from '../../screens/Wallets/Send/Contacts';
import CoinSelection from '../../screens/Wallets/Send/CoinSelection';
import AuthCheck from '../../screens/Wallets/Send/SendAuthCheck';
import { NavigationContainer } from '../../styles/components';
import {
	resetOnChainTransaction,
	setupOnChainTransaction,
} from '../../store/actions/wallet';
import { useSnapPoints } from '../../hooks/bottomSheet';
import { viewControllerIsOpenSelector } from '../../store/reselect/ui';

export type SendNavigationProp = NativeStackNavigationProp<SendStackParamList>;

export type SendStackParamList = {
	AuthCheck: { onSuccess: () => void };
	AddressAndAmount: undefined;
	Scanner: undefined;
	Contacts: undefined;
	Tags: undefined;
	CoinSelection: undefined;
	FeeRate: undefined;
	FeeCustom: undefined;
	ReviewAndSend: undefined;
	AutoRebalance: undefined;
	Result: {
		success: boolean;
		txId?: string;
		errorTitle?: string;
		errorMessage?: string;
	};
};

const Stack = createNativeStackNavigator<SendStackParamList>();
const screenOptions: NativeStackNavigationOptions = {
	headerShown: false,
};

const SendNavigation = (): ReactElement => {
	const snapPoints = useSnapPoints('large');
	const isOpen = useSelector((state) =>
		viewControllerIsOpenSelector(state, 'sendNavigation'),
	);

	return (
		<BottomSheetWrapper
			view="sendNavigation"
			snapPoints={snapPoints}
			onClose={resetOnChainTransaction}
			onOpen={setupOnChainTransaction}>
			<NavigationContainer key={isOpen}>
				<Stack.Navigator screenOptions={screenOptions}>
					<Stack.Screen name="AddressAndAmount" component={AddressAndAmount} />
					<Stack.Screen name="Scanner" component={Scanner} />
					<Stack.Screen name="Contacts" component={Contacts} />
					<Stack.Screen name="CoinSelection" component={CoinSelection} />
					<Stack.Screen name="FeeRate" component={FeeRate} />
					<Stack.Screen name="FeeCustom" component={FeeCustom} />
					<Stack.Screen name="Tags" component={Tags} />
					<Stack.Screen name="AuthCheck" component={AuthCheck} />
					<Stack.Screen name="ReviewAndSend" component={ReviewAndSend} />
					<Stack.Screen name="AutoRebalance" component={AutoRebalance} />
					<Stack.Screen name="Result" component={Result} />
				</Stack.Navigator>
			</NavigationContainer>
		</BottomSheetWrapper>
	);
};

export default memo(SendNavigation);
