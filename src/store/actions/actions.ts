const actions = {
	// Root
	WIPE_APP: 'WIPE_APP',

	// User
	UPDATE_USER: 'UPDATE_USER',
	IGNORE_APP_UPDATE: 'IGNORE_APP_UPDATE',
	IGNORE_BACKUP: 'IGNORE_BACKUP',
	IGNORE_HIGH_BALANCE: 'IGNORE_HIGH_BALANCE',
	SET_LIGHTNING_SETTING_UP_STEP: 'SET_LIGHTNING_SETTING_UP_STEP',
	START_COOP_CLOSE_TIMER: 'START_COOP_CLOSE_TIMER',
	CLEAR_COOP_CLOSE_TIMER: 'CLEAR_COOP_CLOSE_TIMER',
	VERIFY_BACKUP: 'VERIFY_BACKUP',
	RESET_USER_STORE: 'RESET_USER_STORE',
	ACCEPT_BETA_RISK: 'ACCEPT_BETA_RISK',

	// Wallet
	UPDATE_WALLET: 'UPDATE_WALLET',
	UPDATE_HEADER: 'UPDATE_HEADER',
	UPDATE_WALLET_BALANCE: 'UPDATE_WALLET_BALANCE',
	CREATE_WALLET: 'CREATE_WALLET',
	RESET_WALLET_STORE: 'RESET_WALLET_STORE',
	RESET_SELECTED_WALLET: 'RESET_SELECTED_WALLET',
	RESET_EXCHANGE_RATES: 'RESET_EXCHANGE_RATES',
	SETUP_ON_CHAIN_TRANSACTION: 'SETUP_ON_CHAIN_TRANSACTION',
	DELETE_ON_CHAIN_TRANSACTION: 'DELETE_ON_CHAIN_TRANSACTION',
	UPDATE_SEND_TRANSACTION: 'UPDATE_SEND_TRANSACTION',
	RESET_SEND_TRANSACTION: 'RESET_SEND_TRANSACTION',
	ADD_BOOSTED_TRANSACTION: 'ADD_BOOSTED_TRANSACTION',
	UPDATE_ADDRESS_INDEX: 'UPDATE_ADDRESS_INDEX',
	UPDATE_SELECTED_ADDRESS_TYPE: 'UPDATE_SELECTED_ADDRESS_TYPE',
	ADD_ADDRESSES: 'ADD_ADDRESSES',
	RESET_ADDRESSES: 'RESET_ADDRESSES',
	UPDATE_UTXOS: 'UPDATE_UTXOS',
	UPDATE_TRANSACTIONS: 'UPDATE_TRANSACTIONS',
	RESET_TRANSACTIONS: 'RESET_TRANSACTIONS',
	ADD_UNCONFIRMED_TRANSACTIONS: 'ADD_UNCONFIRMED_TRANSACTIONS',
	UPDATE_UNCONFIRMED_TRANSACTIONS: 'UPDATE_UNCONFIRMED_TRANSACTIONS',
	REPLACE_IMPACTED_ADDRESSES: 'REPLACE_IMPACTED_ADDRESSES',

	// Receive
	UPDATE_INVOICE: 'UPDATE_INVOICE',
	DELETE_INVOICE_TAG: 'DELETE_INVOICE_TAG',
	RESET_INVOICE: 'RESET_INVOICE',

	// Lightning
	UPDATE_LIGHTNING: 'UPDATE_LIGHTNING',
	UPDATE_LIGHTNING_NODE_ID: 'UPDATE_LIGHTNING_NODE_ID',
	UPDATE_LIGHTNING_CHANNELS: 'UPDATE_LIGHTNING_CHANNELS',
	UPDATE_LIGHTNING_NODE_VERSION: 'UPDATE_LIGHTNING_NODE_VERSION',
	SAVE_LIGHTNING_PEER: 'SAVE_LIGHTNING_PEER',
	REMOVE_LIGHTNING_PEER: 'REMOVE_LIGHTNING_PEER',
	UPDATE_CLAIMABLE_BALANCE: 'UPDATE_CLAIMABLE_BALANCE',
	RESET_LIGHTNING_STORE: 'RESET_LIGHTNING_STORE',
	UPDATE_LDK_ACCOUNT_VERSION: 'UPDATE_LDK_ACCOUNT_VERSION',

	// Backup
	BACKUP_UPDATE: 'BACKUP_UPDATE',
	RESET_BACKUP_STORE: 'RESET_BACKUP_STORE',
	BACKUP_SEEDER_CHECK_START: 'BACKUP_SEEDER_CHECK_START',
	BACKUP_SEEDER_CHECK_END: 'BACKUP_SEEDER_CHECK_END',

	// Blocktank
	UPDATE_BLOCKTANK: 'UPDATE_BLOCKTANK',
	UPDATE_BLOCKTANK_ORDER: 'UPDATE_BLOCKTANK_ORDER',
	UPDATE_BLOCKTANK_INFO: 'UPDATE_BLOCKTANK_INFO',
	ADD_PAID_BLOCKTANK_ORDER: 'ADD_PAID_BLOCKTANK_ORDER',
	RESET_BLOCKTANK_ORDERS: 'RESET_BLOCKTANK_ORDERS',
	RESET_BLOCKTANK_STORE: 'RESET_BLOCKTANK_STORE',
	ADD_CJIT_ENTRY: 'ADD_CJIT_ENTRY',
	UPDATE_CJIT_ENTRY: 'UPDATE_CJIT_ENTRY',

	// Todos
	RESET_TODOS: 'RESET_TODOS',
	HIDE_TODO: 'HIDE_TODO',
	RESET_HIDDEN_TODOS: 'RESET_HIDDEN_TODOS',
	CHANNEL_NOTIFICATION_SHOWN: 'CHANNEL_NOTIFICATION_SHOWN',

	// Fees
	UPDATE_ONCHAIN_FEE_ESTIMATES: 'UPDATE_ONCHAIN_FEE_ESTIMATES',
	RESET_FEES_STORE: 'RESET_FEES_STORE',
	UPDATE_OVERRIDE_FEES: 'UPDATE_OVERRIDE_FEES',

	// Metadata
	UPDATE_META_TX_TAGS: 'UPDATE_META_TX_TAGS',
	ADD_META_TX_TAG: 'ADD_META_TX_TAG',
	DELETE_META_TX_TAG: 'DELETE_META_TX_TAG',
	ADD_META_TX_SLASH_TAGS_URL: 'ADD_META_TX_SLASH_TAGS_URL',
	DELETE_META_TX_SLASH_TAGS_URL: 'DELETE_META_TX_SLASH_TAGS_URL',
	UPDATE_PENDING_INVOICE: 'UPDATE_PENDING_INVOICE',
	DELETE_PENDING_INVOICE: 'DELETE_PENDING_INVOICE',
	ADD_META_INC_TX_TAG: 'ADD_META_INC_TX_TAG',
	DELETE_META_INC_TX_TAG: 'DELETE_META_INC_TX_TAG',
	MOVE_META_INC_TX_TAG: 'MOVE_META_INC_TX_TAG',
	RESET_META_STORE: 'RESET_META_STORE',
	ADD_TAG: 'ADD_TAG',
	DELETE_TAG: 'DELETE_TAG',
	UPDATE_META: 'UPDATE_META',

	// Profile and Contacts
	SET_ONBOARDING_PROFILE_STEP: 'SET_ONBOARDING_PROFILE_STEP',
	SET_VISITED_CONTACTS: 'SET_VISITED_CONTACTS',
	SET_LAST_SEEDER_REQUEST: 'SET_LAST_SEEDER_REQUEST',
	SET_LINKS: 'SET_LINKS',
	ADD_LINK: 'ADD_LINK',
	EDIT_LINK: 'EDIT_LINK',
	DELETE_LINK: 'DELETE_LINK',
	RESET_SLASHTAGS_STORE: 'RESET_SLASHTAGS_STORE',
	CACHE_PROFILE: 'CACHE_PROFILE',
	CONTACT_ADD: 'CONTACT_ADD',
	CONTACTS_ADD: 'CONTACTS_ADD',
	CONTACT_DELETE: 'CONTACT_DELETE',
	CACHE_PROFILE2: 'CACHE_PROFILE2',
	UPDATE_LAST_PAID_CONTACTS: 'UPDATE_LAST_PAID_CONTACTS',

	// Widgets
	UPDATE_WIDGETS: 'UPDATE_WIDGETS',
	SET_AUTH_WIDGET: 'SET_AUTH_WIDGET',
	SET_FEED_WIDGET: 'SET_FEED_WIDGET',
	DELETE_WIDGET: 'DELETE_WIDGET',
	RESET_WIDGETS_STORE: 'RESET_WIDGETS_STORE',
	SET_WIDGETS_ONBOARDING: 'SET_WIDGETS_ONBOARDING',
	SET_WIDGETS_SORT_ORDER: 'SET_WIDGETS_SORT_ORDER',

	// Settings
	UPDATE_SETTINGS: 'UPDATE_SETTINGS',
	UPDATE_ELECTRUM_PEERS: 'UPDATE_ELECTRUM_PEERS',
	ADD_TREASURE_CHEST: 'ADD_TREASURE_CHEST',
	UPDATE_TREASURE_CHEST: 'UPDATE_TREASURE_CHEST',
	RESET_SETTINGS_STORE: 'RESET_SETTINGS_STORE',

	//Checks
	ADD_WARNING: 'ADD_WARNING',
	UPDATE_WARNINGS: 'UPDATE_WARNINGS',
	RESET_CHECKS_STORE: 'RESET_CHECKS_STORE',
};
export default actions;
