import { EPaymentType } from './wallet';

export enum EActivityType {
	onchain = 'onchain',
	lightning = 'lightning',
}

export type IActivityItem = TOnchainActivityItem | TLightningActivityItem;

export type TOnchainActivityItem = {
	id: string;
	activityType: EActivityType.onchain;
	txType: EPaymentType;
	txId: string;
	value: number;
	fee: number;
	feeRate: number;
	address: string;
	confirmed: boolean;
	timestamp: number;
	isBoosted: boolean;
	isTransfer: boolean;
	exists: boolean; // Used to determine if the transaction exists on the blockchain or if it was reorg'd/bumped from the mempool.
	confirmTimestamp?: number;
	channelId?: string;
};

export type TLightningActivityItem = {
	id: string;
	activityType: EActivityType.lightning;
	txType: EPaymentType;
	value: number;
	fee?: number;
	address: string;
	confirmed: boolean;
	message: string;
	timestamp: number;
};
