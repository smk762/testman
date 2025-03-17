/* tslint:disable */
/* eslint-disable */
/**
* Runs a MarketMaker2 instance.
*
* # Parameters
*
* * `conf` is a UTF-8 string JSON.
* * `log_cb` is a JS function with the following signature:
* ```typescript
* function(level: number, line: string)
* ```
*
* # Usage
*
* ```javascript
* import init, {mm2_main, LogLevel, Mm2MainErr} from "./path/to/mm2.js";
*
* const params = {
*     conf: { "gui":"WASMTEST", mm2:1, "passphrase":"YOUR_PASSPHRASE_HERE", "rpc_password":"test123", "coins":[{"coin":"ETH","protocol":{"type":"ETH"}}] },
*     log_level: LogLevel.Info,
* };
* let handle_log = function (_level, line) { console.log(line) };
* try {
*     mm2_main(params, handle_log);
* } catch (e) {
*     switch (e) {
*         case Mm2MainErr.AlreadyRuns:
*             alert("MarketMaker2 already runs...");
*             break;
*         // handle other errors...
*         default:
*             alert(`Unexpected error: ${e}`);
*             break;
*     }
* }
* ```
* @param {any} params
* @param {Function} log_cb
*/
export function mm2_main(params: any, log_cb: Function): void;
/**
* Returns the MarketMaker2 instance status.
* @returns {number}
*/
export function mm2_main_status(): number;
/**
* Invokes an RPC request.
*
* # Parameters
*
* * `payload` is a UTF-8 string JSON.
*
* # Usage
*
* ```javascript
* import init, {mm2_rpc, Mm2RpcErr} from "./path/to/mm2.js";
*
* async function version () {
*     try {
*         const payload = {
*             "userpass": "test123",
*             "method": "version",
*         };
*         const response = await mm2_rpc(payload);
*         return response.result;
*     } catch (e) {
*         switch (e) {
*             case Mm2RpcErr.NotRunning:
*                 alert("MarketMaker2 not running yet...");
*                 break;
*             // handle other errors...
*             default:
*                 alert(`Unexpected error: ${e}`);
*                 break;
*         }
*     }
* }
* ```
* @param {any} payload
* @returns {Promise<any>}
*/
export function mm2_rpc(payload: any): Promise<any>;
/**
* Get the MarketMaker2 version.
*
* # Usage
*
* The function can be used before mm2 runs.
*
* ```javascript
* import init, {mm2_version} from "./path/to/mm2.js";
*
* function print_version () {
*     const response = mm2_version();
*     console.log(`version: ${response.result}, datetime: ${response.datetime}`);
* }
* ```
* @returns {any}
*/
export function mm2_version(): any;
/**
* Stops the MarketMaker2 instance.
*
* # Usage
*
* ```javascript
* import init, {mm2_stop} from "./path/to/mm2.js";
*
* async function stop () {
*     try {
*         await mm2_stop();
*     } catch (e) {
*         switch (e) {
*             case Mm2RpcErr.NotRunning:
*                 alert("MarketMaker2 not running yet...");
*                 break;
*             // handle other errors...
*             default:
*                 alert(`Unexpected error: ${e}`);
*                 break;
*         }
*     }
* }
* ```
* @returns {Promise<void>}
*/
export function mm2_stop(): Promise<void>;
/**
* Handler for `console.log` invocations.
*
* If a test is currently running it takes the `args` array and stringifies
* it and appends it to the current output of the test. Otherwise it passes
* the arguments to the original `console.log` function, psased as
* `original`.
* @param {Array<any>} args
*/
export function __wbgtest_console_log(args: Array<any>): void;
/**
* Handler for `console.debug` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_debug(args: Array<any>): void;
/**
* Handler for `console.info` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_info(args: Array<any>): void;
/**
* Handler for `console.warn` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_warn(args: Array<any>): void;
/**
* Handler for `console.error` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_error(args: Array<any>): void;
/**
* The errors can be thrown when using the `mm2_main` function incorrectly.
*/
export enum Mm2MainErr {
  AlreadyRuns = 1,
  InvalidParams = 2,
  NoCoinsInConf = 3,
}
/**
* The errors can be thrown when using the `mm2_rpc` function incorrectly.
*/
export enum Mm2RpcErr {
  NotRunning = 1,
  InvalidPayload = 2,
  InternalError = 3,
}
/**
*/
export enum MainStatus {
/**
* MM2 is not running yet.
*/
  NotRunning = 0,
/**
* MM2 is running, but no context yet.
*/
  NoContext = 1,
/**
* MM2 is running, but no RPC yet.
*/
  NoRpc = 2,
/**
* MM2's RPC is up.
*/
  RpcIsUp = 3,
}
/**
*/
export enum LogLevel {
/**
* A level lower than all log levels.
*/
  Off = 0,
/**
* Corresponds to the `ERROR` log level.
*/
  Error = 1,
/**
* Corresponds to the `WARN` log level.
*/
  Warn = 2,
/**
* Corresponds to the `INFO` log level.
*/
  Info = 3,
/**
* Corresponds to the `DEBUG` log level.
*/
  Debug = 4,
/**
* Corresponds to the `TRACE` log level.
*/
  Trace = 5,
}
/**
*/
export class RequestArguments {
  free(): void;
/**
*/
  readonly method: string;
/**
*/
  readonly params: Array<any>;
}
/**
* Runtime test harness support instantiated in JS.
*
* The node.js entry script instantiates a `Context` here which is used to
* drive test execution.
*/
export class WasmBindgenTestContext {
  free(): void;
/**
* Creates a new context ready to run tests.
*
* A `Context` is the main structure through which test execution is
* coordinated, and this will collect output and results for all executed
* tests.
*/
  constructor();
/**
* Inform this context about runtime arguments passed to the test
* harness.
*
* Eventually this will be used to support flags, but for now it's just
* used to support test filters.
* @param {any[]} args
*/
  args(args: any[]): void;
/**
* Executes a list of tests, returning a promise representing their
* eventual completion.
*
* This is the main entry point for executing tests. All the tests passed
* in are the JS `Function` object that was plucked off the
* `WebAssembly.Instance` exports list.
*
* The promise returned resolves to either `true` if all tests passed or
* `false` if at least one test failed.
* @param {any[]} tests
* @returns {Promise<any>}
*/
  run(tests: any[]): Promise<any>;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly mm2_main: (a: number, b: number, c: number) => void;
  readonly mm2_main_status: () => number;
  readonly mm2_rpc: (a: number) => number;
  readonly mm2_version: () => number;
  readonly mm2_stop: () => number;
  readonly __wbgt_test_delete_my_maker_order_0: (a: number) => void;
  readonly __wbgt_test_delete_my_taker_order_1: (a: number) => void;
  readonly __wbgt_test_load_active_maker_taker_orders_2: (a: number) => void;
  readonly __wbgt_test_filtering_history_3: (a: number) => void;
  readonly __wbgt_test_take_according_to_paging_opts_4: (a: number) => void;
  readonly __wbgt_test_my_recent_swaps_5: (a: number) => void;
  readonly __wbgt_test_saved_swap_table_6: (a: number) => void;
  readonly __wbgt_test_get_current_migration_7: (a: number) => void;
  readonly __wbgt_test_migrate_swaps_data_8: (a: number) => void;
  readonly __wbgt_test_file_lock_should_create_file_and_record_timestamp_and_then_delete_on_drop_9: (a: number) => void;
  readonly __wbgt_test_file_lock_should_return_none_if_lock_acquired_10: (a: number) => void;
  readonly __wbgt_test_file_lock_should_acquire_and_update_timestamp_if_ttl_expired_11: (a: number) => void;
  readonly __wbgt_test_encode_decode_12: (a: number) => void;
  readonly __wbgt_test_expired_message_13: (a: number) => void;
  readonly __wbgt_test_corrupted_messages_14: (a: number) => void;
  readonly __wbgt_test_valid_message_15: (a: number) => void;
  readonly __wbgt_test_peer_address_16: (a: number) => void;
  readonly __wbgt_test_init_collection_0: (a: number) => void;
  readonly __wbgt_test_upload_account_1: (a: number) => void;
  readonly __wbgt_test_enable_account_2: (a: number) => void;
  readonly __wbgt_test_set_name_desc_balance_3: (a: number) => void;
  readonly __wbgt_test_activate_deactivate_coins_4: (a: number) => void;
  readonly __wbgt_test_load_enabled_account_with_coins_5: (a: number) => void;
  readonly __wbgt_test_load_accounts_with_enabled_flag_6: (a: number) => void;
  readonly __wbgt_test_delete_account_7: (a: number) => void;
  readonly __wbgt_test_delete_account_clears_coins_8: (a: number) => void;
  readonly __wbgt_pass_0: (a: number) => void;
  readonly __wbgt_test_init_eth_coin_1: (a: number) => void;
  readonly __wbgt_wasm_test_sign_eth_tx_2: (a: number) => void;
  readonly __wbgt_wasm_test_sign_eth_tx_with_priority_fee_3: (a: number) => void;
  readonly __wbgt_test_get_abci_info_4: (a: number) => void;
  readonly __wbgt_test_tx_history_5: (a: number) => void;
  readonly __wbgt_test_init_collection_6: (a: number) => void;
  readonly __wbgt_test_add_transactions_7: (a: number) => void;
  readonly __wbgt_test_remove_transaction_8: (a: number) => void;
  readonly __wbgt_test_get_transaction_9: (a: number) => void;
  readonly __wbgt_test_update_transaction_10: (a: number) => void;
  readonly __wbgt_test_contains_and_get_unconfirmed_transaction_11: (a: number) => void;
  readonly __wbgt_test_has_transactions_with_hash_12: (a: number) => void;
  readonly __wbgt_test_unique_tx_hashes_num_13: (a: number) => void;
  readonly __wbgt_test_add_and_get_tx_from_cache_14: (a: number) => void;
  readonly __wbgt_test_get_raw_tx_bytes_on_add_transactions_15: (a: number) => void;
  readonly __wbgt_test_get_history_page_number_16: (a: number) => void;
  readonly __wbgt_test_get_history_from_id_17: (a: number) => void;
  readonly __wbgt_test_get_history_for_addresses_18: (a: number) => void;
  readonly __wbgt_test_storage_init_19: (a: number) => void;
  readonly __wbgt_test_add_block_headers_20: (a: number) => void;
  readonly __wbgt_test_test_get_block_header_21: (a: number) => void;
  readonly __wbgt_test_get_last_block_header_with_non_max_bits_22: (a: number) => void;
  readonly __wbgt_test_get_last_block_height_23: (a: number) => void;
  readonly __wbgt_test_remove_headers_from_storage_24: (a: number) => void;
  readonly __wbgt_test_electrum_rpc_client_25: (a: number) => void;
  readonly __wbgt_test_electrum_display_balances_26: (a: number) => void;
  readonly __wbgt_test_hd_utxo_tx_history_27: (a: number) => void;
  readonly __wbgt_test_insert_block_and_get_latest_block_28: (a: number) => void;
  readonly __wbgt_test_rewind_to_height_29: (a: number) => void;
  readonly __wbgt_test_transport_30: (a: number) => void;
  readonly __wbgt_test_download_save_and_get_params_31: (a: number) => void;
  readonly __wbgt_test_check_for_no_params_32: (a: number) => void;
  readonly __wbgt_test_clear_all_history_33: (a: number) => void;
  readonly __wbgt_test_clear_history_34: (a: number) => void;
  readonly __wbgt_test_exclude_transfer_phishing_spam_35: (a: number) => void;
  readonly __wbgt_test_update_transfer_phishing_by_domain_36: (a: number) => void;
  readonly __wbgt_test_get_domains_37: (a: number) => void;
  readonly __wbgt_test_exclude_transfer_spam_38: (a: number) => void;
  readonly __wbgt_test_get_token_addresses_39: (a: number) => void;
  readonly __wbgt_test_update_transfer_spam_by_token_address_40: (a: number) => void;
  readonly __wbgt_test_get_update_transfer_meta_41: (a: number) => void;
  readonly __wbgt_test_transfer_history_filters_42: (a: number) => void;
  readonly __wbgt_test_transfer_history_43: (a: number) => void;
  readonly __wbgt_test_last_transfer_block_44: (a: number) => void;
  readonly __wbgt_test_add_get_transfers_45: (a: number) => void;
  readonly __wbgt_test_clear_all_nft_46: (a: number) => void;
  readonly __wbgt_test_clear_nft_47: (a: number) => void;
  readonly __wbgt_test_exclude_nft_phishing_spam_48: (a: number) => void;
  readonly __wbgt_test_update_nft_phishing_by_domain_49: (a: number) => void;
  readonly __wbgt_test_get_animation_external_domains_50: (a: number) => void;
  readonly __wbgt_test_exclude_nft_spam_51: (a: number) => void;
  readonly __wbgt_test_update_nft_spam_by_token_address_52: (a: number) => void;
  readonly __wbgt_test_refresh_metadata_53: (a: number) => void;
  readonly __wbgt_test_nft_amount_54: (a: number) => void;
  readonly __wbgt_test_remove_nft_55: (a: number) => void;
  readonly __wbgt_test_nft_list_56: (a: number) => void;
  readonly __wbgt_test_last_nft_block_57: (a: number) => void;
  readonly __wbgt_test_add_get_nfts_58: (a: number) => void;
  readonly __wbgt_test_camo_59: (a: number) => void;
  readonly __wbgt_test_antispam_scan_endpoints_60: (a: number) => void;
  readonly __wbgt_test_moralis_requests_61: (a: number) => void;
  readonly __wbgt_test_check_for_spam_links_62: (a: number) => void;
  readonly __wbgt_test_invalid_moralis_ipfs_link_63: (a: number) => void;
  readonly __wbgt_test_get_domain_from_url_64: (a: number) => void;
  readonly __wbgt_test_moralis_ipfs_bafy_65: (a: number) => void;
  readonly __wbgt_test_is_malicious_66: (a: number) => void;
  readonly __wbgt_test_get_value_from_event_attributes_67: (a: number) => void;
  readonly __wbgt_test_update_account_68: (a: number) => void;
  readonly __wbgt_test_delete_accounts_69: (a: number) => void;
  readonly __wbgt_test_unique_wallets_70: (a: number) => void;
  readonly __wbgt_test_be_big_uint_ser_de_0: (a: number) => void;
  readonly __wbgt_test_be_big_uint_debug_display_1: (a: number) => void;
  readonly __wbgt_test_on_iteration_multiple_only_and_bound_values_2: (a: number) => void;
  readonly __wbgt_test_on_iteration_multiple_bound_values_3: (a: number) => void;
  readonly __wbgt_test_on_iteration_single_only_and_bound_values_4: (a: number) => void;
  readonly __wbgt_test_on_iteration_error_5: (a: number) => void;
  readonly __wbgt_test_be_big_uint_index_6: (a: number) => void;
  readonly __wbgt_test_collect_single_key_cursor_7: (a: number) => void;
  readonly __wbgt_test_collect_single_key_bound_cursor_8: (a: number) => void;
  readonly __wbgt_test_collect_multi_key_cursor_9: (a: number) => void;
  readonly __wbgt_test_collect_multi_key_bound_cursor_10: (a: number) => void;
  readonly __wbgt_test_collect_multi_key_bound_cursor_big_int_11: (a: number) => void;
  readonly __wbgt_test_iter_without_constraints_12: (a: number) => void;
  readonly __wbgt_test_rev_iter_without_constraints_13: (a: number) => void;
  readonly __wbgt_test_iter_single_key_bound_cursor_14: (a: number) => void;
  readonly __wbgt_test_rev_iter_single_key_bound_cursor_15: (a: number) => void;
  readonly __wbgt_test_cursor_where_condition_16: (a: number) => void;
  readonly __wbgt_test_cursor_where_first_condition_17: (a: number) => void;
  readonly __wbgt_test_cursor_where_first_but_reversed_condition_18: (a: number) => void;
  readonly __wbgt_test_cursor_where_condition_with_limit_19: (a: number) => void;
  readonly __wbgt_test_cursor_with_limit_20: (a: number) => void;
  readonly __wbgt_test_cursor_with_offset_and_limit_21: (a: number) => void;
  readonly __wbgt_test_add_get_item_22: (a: number) => void;
  readonly __wbgt_test_add_item_or_ignore_23: (a: number) => void;
  readonly __wbgt_test_count_24: (a: number) => void;
  readonly __wbgt_test_replace_item_25: (a: number) => void;
  readonly __wbgt_test_delete_item_26: (a: number) => void;
  readonly __wbgt_test_clear_27: (a: number) => void;
  readonly __wbgt_test_upgrade_needed_28: (a: number) => void;
  readonly __wbgt_test_open_twice_29: (a: number) => void;
  readonly __wbgt_test_open_close_and_open_30: (a: number) => void;
  readonly __wbgt_test_non_string_index_31: (a: number) => void;
  readonly __wbgt_test_transaction_abort_on_error_32: (a: number) => void;
  readonly __wbgt_fetch_get_test_0: (a: number) => void;
  readonly __wbgt_test_websocket_1: (a: number) => void;
  readonly __wbgt_test_websocket_unreachable_url_2: (a: number) => void;
  readonly __wbgt_test_hash_adex_login_request_0: (a: number) => void;
  readonly __wbgt_test_encrypt_decrypt_with_slip21_1: (a: number) => void;
  readonly __wbgt_test_mnemonic_with_last_byte_zero_2: (a: number) => void;
  readonly __wbgt_test_encrypt_decrypt_mnemonic_3: (a: number) => void;
  readonly __wbgt_test_slip_0021_key_derivation_4: (a: number) => void;
  readonly __wbg_requestarguments_free: (a: number) => void;
  readonly requestarguments_method: (a: number, b: number) => void;
  readonly requestarguments_params: (a: number) => number;
  readonly rustsecp256k1_v0_4_1_context_create: (a: number) => number;
  readonly rustsecp256k1_v0_4_1_context_destroy: (a: number) => void;
  readonly rustsecp256k1_v0_4_1_default_illegal_callback_fn: (a: number, b: number) => void;
  readonly rustsecp256k1_v0_4_1_default_error_callback_fn: (a: number, b: number) => void;
  readonly __wbgt_test_multiple_messages_and_drop_0: (a: number) => void;
  readonly __wbgt_test_broadcast_across_channels_1: (a: number) => void;
  readonly __wbgt_test_channel_cleanup_on_drop_2: (a: number) => void;
  readonly __wbgt_test_multiple_channels_and_broadcast_3: (a: number) => void;
  readonly __wbgt_test_create_channel_and_broadcast_4: (a: number) => void;
  readonly __wbgt_test_clear_expired_entries_0: (a: number) => void;
  readonly __wbg_wasmbindgentestcontext_free: (a: number) => void;
  readonly wasmbindgentestcontext_new: () => number;
  readonly wasmbindgentestcontext_args: (a: number, b: number, c: number) => void;
  readonly wasmbindgentestcontext_run: (a: number, b: number, c: number) => number;
  readonly __wbgtest_console_log: (a: number) => void;
  readonly __wbgtest_console_debug: (a: number) => void;
  readonly __wbgtest_console_info: (a: number) => void;
  readonly __wbgtest_console_warn: (a: number) => void;
  readonly __wbgtest_console_error: (a: number) => void;
  readonly __wbindgen_export_0: (a: number, b: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_export_3: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_4: (a: number, b: number) => void;
  readonly __wbindgen_export_5: (a: number, b: number) => void;
  readonly __wbindgen_export_6: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export_7: (a: number) => void;
  readonly __wbindgen_export_8: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_9: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbindgen_export_10: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
