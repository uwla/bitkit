import { TAvailableNetworks } from '../../utils/networks';

export type TAddressType = 'bech32' | 'segwit' | 'legacy'; //"84" | "49" | "44";

export type TKeyDerivationPath = '84' | '49' | '44'; //"bech32" | "segwit" | "legacy";

export type NetworkTypePath = '0' | '1'; //"mainnet" | "testnet"

export type TBitcoinUnit = 'satoshi' | 'BTC' | 'mBTC' | 'μBTC';

export type TBitcoinAbbreviation = 'sats' | 'BTC';

export type TBitcoinLabel = 'Bitcoin' | 'Bitcoin Testnet';

export type TTicker = 'BTC' | 'tBTC';

export type TTransactionType = 'sent' | 'received';

export enum EWallet {
	selectedNetwork = 'bitcoin',
	defaultWallet = 'wallet0',
	aezeedPassphrase = 'shhhhhhhh123',
	keyDerivationPath = '84',
	addressType = 'bech32',
}

export enum EOutput {
	address = '',
	value = 0,
	index = 0,
}

export interface IWallet {
	loading: boolean;
	error: boolean;
	selectedNetwork: TAvailableNetworks;
	selectedWallet: string;
	exchangeRate: number;
	wallets: { [key: string]: IDefaultWalletShape } | {};
	[key: string]: any;
}

export interface IWalletItem<T> {
	bitcoin: T;
	bitcoinTestnet: T;
	timestamp?: number | null;
}

export interface IAddressContent {
	index: number;
	path: string;
	address: string;
	scriptHash: string;
	publicKey: string;
}

export interface IAddress {
	[key: string]: IAddressContent;
}

export interface ICreateWallet {
	wallet?: string;
	mnemonic?: string;
	addressAmount?: number;
	changeAddressAmount?: number;
	keyDerivationPath?: TKeyDerivationPath;
	addressType?: TAddressType;
}

export interface IUtxo {
	address: string;
	index: number;
	path: string;
	scriptHash: string;
	height: number;
	tx_hash: string;
	tx_pos: number;
	value: number;
}

export interface IOutput {
	address?: string; //Address to send to.
	value?: number; //Amount denominated in sats.
	index?: number;
}

export interface IFormattedTransactionContent {
	address: string;
	height: number;
	scriptHash: string;
	totalInputValue: number;
	matchedInputValue: number;
	totalOutputValue: number;
	matchedOutputValue: number;
	fee: number;
	type: TTransactionType;
	value: number;
	txid: string;
	messages: string[];
	timestamp: number;
}
export interface IFormattedTransaction {
	[key: string]: IFormattedTransactionContent;
}

export interface IOnChainTransactionData {
	outputs?: IOutput[];
	utxos?: IUtxo[];
	changeAddress?: string;
	fiatAmount?: number;
	fee?: number; //Total fee in sats
	satsPerByte?: number;
	recommendedFee?: number; //Total recommended fee in sats
	transactionSize?: number; //In bytes (250 is about normal)
	message?: string; // OP_RETURN data for a given transaction.
	label?: string; // User set label for a given transaction.
}

export const defaultOnChainTransactionData: IOnChainTransactionData = {
	outputs: [EOutput],
	utxos: [],
	changeAddress: '',
	fiatAmount: 0,
	fee: 250,
	satsPerByte: 1,
	recommendedFee: 1,
	transactionSize: 250,
	message: '',
	label: '',
};

export interface IDefaultWalletShape {
	id: string;
	name: string;
	type: string;
	addresses: IWalletItem<IAddressContent> | IWalletItem<{}>;
	addressIndex: IWalletItem<IAddressContent>;
	changeAddresses: IWalletItem<IAddressContent> | IWalletItem<{}>;
	changeAddressIndex: IWalletItem<IAddressContent>;
	utxos: IWalletItem<IUtxo> | IWalletItem<[]>;
	transactions: IWalletItem<IFormattedTransaction> | IWalletItem<{}>;
	blacklistedUtxos: IWalletItem<[]>;
	balance: IWalletItem<number>;
	lastUpdated: IWalletItem<number>;
	hasBackedUpWallet: boolean;
	walletBackupTimestamp: string;
	keyDerivationPath: IWalletItem<TKeyDerivationPath>;
	networkTypePath: IWalletItem<string>;
	addressType: {
		bitcoin: TAddressType;
		bitcoinTestnet: TAddressType;
	};
	rbfData: IWalletItem<object>;
	transaction: IWalletItem<IOnChainTransactionData>;
}

export interface IDefaultWallet {
	[key: string]: IDefaultWalletShape;
}
