import { ENetworks, TAccount } from '@synonymdev/react-native-ldk';

export type TBackupState = {
	//Backpack
	remoteBackupsEnabled: boolean;
	remoteLdkBackupSynced: boolean;
	remoteLdkBackupLastSync?: number;
	remoteLdkBackupLastSyncRequired?: number;
	remoteSettingsBackupSynced: boolean;
	remoteSettingsBackupLastSync?: number;
	remoteSettingsBackupSyncRequired?: number;
	remoteWidgetsBackupSynced: boolean;
	remoteWidgetsBackupLastSync?: number;
	remoteWidgetsBackupSyncRequired?: number;
	remoteMetadataBackupSynced: boolean;
	remoteMetadataBackupLastSync?: number;
	remoteMetadataBackupSyncRequired?: number;
	remoteLdkActivityBackupSynced: boolean;
	remoteLdkActivityBackupLastSync?: number;
	remoteLdkActivityBackupSyncRequired?: number;
	remoteBlocktankBackupSynced: boolean;
	remoteBlocktankBackupLastSync?: number;
	remoteBlocktankBackupSyncRequired?: number;
	remoteSlashtagsBackupSynced: boolean;
	remoteSlashtagsBackupLastSync?: number;
	remoteSlashtagsBackupSyncRequired?: number;

	//Hyperdrives
	hyperProfileSeedCheckSuccess?: number;
	hyperProfileCheckRequested?: number;
	hyperContactsCheckSuccess?: number;
	hyperContactsCheckRequested?: number;

	//iCloud
	iCloudBackupsEnabled: boolean;
	iCloudLdkBackupsSynced: boolean;
	iCloudLdkBackupLastSync?: number;
	//TODO transactions, slashtags, metadata, etc.

	//Google Drive
	gDriveBackupsEnabled: boolean;
	gDriveLdkBackupsSynced: boolean;
	gDriveLdkBackupLastSync?: number;
	//TODO transactions, slashtags, metadata, etc.
};

export declare type TAccountBackup<T> = {
	account: TAccount;
	package_version: string;
	network: ENetworks;
	data: T;
};
