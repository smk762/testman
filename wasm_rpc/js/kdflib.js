import { get_webusb } from './snippets/hw_common-c933ea30ea0fef0d/inline0.js';
import { device_interface } from './snippets/hw_common-c933ea30ea0fef0d/inline1.js';
import { websocket_transport } from './snippets/libp2p-wasm-ext-7e5f5edb880ee0f5/src/websockets.js';
import { get_provider_js } from './snippets/web3-3a881fca17d19cd8/inline0.js';

let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_38(arg0, arg1, arg2) {
    wasm.__wbindgen_export_3(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_47(arg0, arg1) {
    wasm.__wbindgen_export_4(arg0, arg1);
}

function __wbg_adapter_50(arg0, arg1) {
    wasm.__wbindgen_export_5(arg0, arg1);
}

function __wbg_adapter_53(arg0, arg1, arg2) {
    wasm.__wbindgen_export_6(arg0, arg1, addHeapObject(arg2));
}

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
export function mm2_main(params, log_cb) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.mm2_main(retptr, addHeapObject(params), addHeapObject(log_cb));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        if (r1) {
            throw takeObject(r0);
        }
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
* Returns the MarketMaker2 instance status.
* @returns {number}
*/
export function mm2_main_status() {
    const ret = wasm.mm2_main_status();
    return ret >>> 0;
}

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
export function mm2_rpc(payload) {
    const ret = wasm.mm2_rpc(addHeapObject(payload));
    return takeObject(ret);
}

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
export function mm2_version() {
    const ret = wasm.mm2_version();
    return takeObject(ret);
}

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
export function mm2_stop() {
    const ret = wasm.mm2_stop();
    return takeObject(ret);
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export_7(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }

let stack_pointer = 128;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
/**
* Handler for `console.log` invocations.
*
* If a test is currently running it takes the `args` array and stringifies
* it and appends it to the current output of the test. Otherwise it passes
* the arguments to the original `console.log` function, psased as
* `original`.
* @param {Array<any>} args
*/
export function __wbgtest_console_log(args) {
    try {
        wasm.__wbgtest_console_log(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
* Handler for `console.debug` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_debug(args) {
    try {
        wasm.__wbgtest_console_debug(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
* Handler for `console.info` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_info(args) {
    try {
        wasm.__wbgtest_console_info(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
* Handler for `console.warn` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_warn(args) {
    try {
        wasm.__wbgtest_console_warn(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

/**
* Handler for `console.error` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_error(args) {
    try {
        wasm.__wbgtest_console_error(addBorrowedObject(args));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

function __wbg_adapter_409(arg0, arg1, arg2, arg3, arg4) {
    wasm.__wbindgen_export_9(arg0, arg1, addHeapObject(arg2), arg3, addHeapObject(arg4));
}

function __wbg_adapter_484(arg0, arg1, arg2, arg3) {
    wasm.__wbindgen_export_10(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
* The errors can be thrown when using the `mm2_main` function incorrectly.
*/
export const Mm2MainErr = Object.freeze({ AlreadyRuns:1,"1":"AlreadyRuns",InvalidParams:2,"2":"InvalidParams",NoCoinsInConf:3,"3":"NoCoinsInConf", });
/**
* The errors can be thrown when using the `mm2_rpc` function incorrectly.
*/
export const Mm2RpcErr = Object.freeze({ NotRunning:1,"1":"NotRunning",InvalidPayload:2,"2":"InvalidPayload",InternalError:3,"3":"InternalError", });
/**
*/
export const MainStatus = Object.freeze({
/**
* MM2 is not running yet.
*/
NotRunning:0,"0":"NotRunning",
/**
* MM2 is running, but no context yet.
*/
NoContext:1,"1":"NoContext",
/**
* MM2 is running, but no RPC yet.
*/
NoRpc:2,"2":"NoRpc",
/**
* MM2's RPC is up.
*/
RpcIsUp:3,"3":"RpcIsUp", });
/**
*/
export const LogLevel = Object.freeze({
/**
* A level lower than all log levels.
*/
Off:0,"0":"Off",
/**
* Corresponds to the `ERROR` log level.
*/
Error:1,"1":"Error",
/**
* Corresponds to the `WARN` log level.
*/
Warn:2,"2":"Warn",
/**
* Corresponds to the `INFO` log level.
*/
Info:3,"3":"Info",
/**
* Corresponds to the `DEBUG` log level.
*/
Debug:4,"4":"Debug",
/**
* Corresponds to the `TRACE` log level.
*/
Trace:5,"5":"Trace", });
/**
*/
export class RequestArguments {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RequestArguments.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_requestarguments_free(ptr);
    }
    /**
    * @returns {string}
    */
    get method() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.requestarguments_method(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_8(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @returns {Array<any>}
    */
    get params() {
        const ret = wasm.requestarguments_params(this.__wbg_ptr);
        return takeObject(ret);
    }
}
/**
* Runtime test harness support instantiated in JS.
*
* The node.js entry script instantiates a `Context` here which is used to
* drive test execution.
*/
export class WasmBindgenTestContext {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmBindgenTestContext.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmbindgentestcontext_free(ptr);
    }
    /**
    * Creates a new context ready to run tests.
    *
    * A `Context` is the main structure through which test execution is
    * coordinated, and this will collect output and results for all executed
    * tests.
    */
    constructor() {
        const ret = wasm.wasmbindgentestcontext_new();
        return WasmBindgenTestContext.__wrap(ret);
    }
    /**
    * Inform this context about runtime arguments passed to the test
    * harness.
    *
    * Eventually this will be used to support flags, but for now it's just
    * used to support test filters.
    * @param {any[]} args
    */
    args(args) {
        const ptr0 = passArrayJsValueToWasm0(args, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        wasm.wasmbindgentestcontext_args(this.__wbg_ptr, ptr0, len0);
    }
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
    run(tests) {
        const ptr0 = passArrayJsValueToWasm0(tests, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmbindgentestcontext_run(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_is_bigint = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'bigint';
        return ret;
    };
    imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
        const ret = getObject(arg0) === getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbindgen_is_null = function(arg0) {
        const ret = getObject(arg0) === null;
        return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg_removeListener_0aa4e435a4a8456d = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).removeListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    };
    imports.wbg.__wbg_request_592acd413b039e69 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).request(RequestArguments.__wrap(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getproviderjs_48385c810e80f80d = function() { return handleError(function () {
        const ret = get_provider_js();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_on_3a2bbb1066ce5a2a = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).on(getStringFromWasm0(arg1, arg2), getObject(arg3));
    };
    imports.wbg.__wbg_deviceinterface_3042f48557658b11 = function() { return handleError(function (arg0) {
        const ret = device_interface(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getwebusb_9b2b7910a8e2f729 = function() {
        const ret = get_webusb();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_02639197c8166a96 = function(arg0, arg1, arg2) {
        getObject(arg0).getRandomValues(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_randomFillSync_dd2297de5917c74e = function(arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_new_d87f272aec784ec0 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_eae29933372a39be = function(arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_e0b3266d2d9eba1a = function(arg0) {
        const ret = getObject(arg0).self;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_crypto_e95a6e54c5c2e37f = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_dc67302a7bd1aec5 = function(arg0) {
        const ret = getObject(arg0).getRandomValues;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_0993fe224bf8e202 = function(arg0, arg1) {
        const ret = require(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_close_6a852f1689b0b8e2 = function(arg0) {
        getObject(arg0).close();
    };
    imports.wbg.__wbg_dial_30e8812bd98d8882 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).dial(getStringFromWasm0(arg1, arg2), arg3 !== 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_listenon_ff60af88e263af6b = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).listen_on(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newaddrs_71100193fa47c194 = function(arg0, arg1) {
        const ret = getObject(arg1).new_addrs;
        var ptr1 = isLikeNone(ret) ? 0 : passArrayJsValueToWasm0(ret, wasm.__wbindgen_export_0);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_newconnections_44d312e897866295 = function(arg0, arg1) {
        const ret = getObject(arg1).new_connections;
        var ptr1 = isLikeNone(ret) ? 0 : passArrayJsValueToWasm0(ret, wasm.__wbindgen_export_0);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_localaddr_91f6c1af88a435e2 = function(arg0, arg1) {
        const ret = getObject(arg1).local_addr;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_observedaddr_1ca1352afe737cc2 = function(arg0, arg1) {
        const ret = getObject(arg1).observed_addr;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_connection_632aa60cbc9cffe2 = function(arg0) {
        const ret = getObject(arg0).connection;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_expiredaddrs_c5a2f22f3c1b584f = function(arg0, arg1) {
        const ret = getObject(arg1).expired_addrs;
        var ptr1 = isLikeNone(ret) ? 0 : passArrayJsValueToWasm0(ret, wasm.__wbindgen_export_0);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_read_c68b57fe8b00a7b9 = function(arg0) {
        const ret = getObject(arg0).read;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_write_3d1f2c679934dd25 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).write(getArrayU8FromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_shutdown_a85687f76230bdad = function() { return handleError(function (arg0) {
        getObject(arg0).shutdown();
    }, arguments) };
    imports.wbg.__wbg_websockettransport_84c8ba3f0c468e40 = function() {
        const ret = websocket_transport();
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbg_Window_fb1ff292e1d47c10 = function(arg0) {
        const ret = getObject(arg0).Window;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_WorkerGlobalScope_32b0cdb58df54a5e = function(arg0) {
        const ret = getObject(arg0).WorkerGlobalScope;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_clearTimeout_3e95d78870dda087 = typeof clearTimeout == 'function' ? clearTimeout : notDefined('clearTimeout');
    imports.wbg.__wbg_setTimeout_b99ca5f895cc67dc = function(arg0, arg1) {
        const ret = setTimeout(getObject(arg0), arg1 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_static_accessor_document_65f5ce2f320505c1 = function() {
        const ret = document;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getElementById_bf7fd63c05ce3a00 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_settextcontent_ad0165bb12798cc0 = function(arg0, arg1, arg2) {
        getObject(arg0).textContent = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_textcontent_ae9ce4aab82c7f6d = function(arg0, arg1) {
        const ret = getObject(arg1).textContent;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_stack_24dbd775b57ebe2b = function(arg0) {
        const ret = getObject(arg0).stack;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_42f1374d948b1ef0 = function(arg0) {
        const ret = getObject(arg0).self;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_log_e08764f3cee27fbf = function(arg0, arg1) {
        console.log(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_stack_2be5973b998d2a2e = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_String_2bc676b2ef7de166 = function(arg0, arg1) {
        const ret = String(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_wbgtestinvoke_d83263f810e5d591 = function() { return handleError(function (arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = () => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_50(a, state0.b, );
                } finally {
                    state0.a = a;
                }
            };
            __wbg_test_invoke(cb0);
        } finally {
            state0.a = state0.b = 0;
        }
    }, arguments) };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_export_8(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_BigInt_06819bca5a5bedef = function(arg0) {
        const ret = BigInt(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_BigInt_d0c7d465bfa30d3b = function(arg0) {
        const ret = BigInt(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_BigInt_67359e71cae1c6c9 = function(arg0) {
        const ret = BigInt(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_BigInt_1fab4952b6c4a499 = function(arg0) {
        const ret = BigInt(BigInt.asUintN(64, arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_String_c9c0f9be374874ba = function(arg0, arg1) {
        const ret = String(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_get_2268d91a19a98b92 = function(arg0, arg1) {
        const ret = getObject(arg0)[takeObject(arg1)];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_c943d600fa71e4dd = function(arg0, arg1, arg2) {
        getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
    };
    imports.wbg.__wbg_crypto_70a96de3b6b73dac = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_process_dd1577445152112e = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_58036bec3add9e6f = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_6a9d28205ed5b0d8 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_msCrypto_adbc770ec9eca9c7 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_f05d779769764e82 = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_3774744e221a22ad = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_randomFillSync_e950366c42764a07 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_instanceof_Window_c4b70662a0d2c5ec = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Blob_da9f4ebaadaae9ed = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Blob;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_CloseEvent_30d4cfe3a0d027a7 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof CloseEvent;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_code_647a33f1670facd4 = function(arg0) {
        const ret = getObject(arg0).code;
        return ret;
    };
    imports.wbg.__wbg_reason_5321d2c8ed151279 = function(arg0, arg1) {
        const ret = getObject(arg1).reason;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_instanceof_DomException_3eda58454e9b214b = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof DOMException;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_name_244f0bb3481743c2 = function(arg0, arg1) {
        const ret = getObject(arg1).name;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_set_f39fb573d174cc05 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).set(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_key_02c14397ec8cd221 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).key;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_advance_f72b3b2149558997 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).advance(arg1 >>> 0);
    }, arguments) };
    imports.wbg.__wbg_continue_2e74928091af089b = function() { return handleError(function (arg0) {
        getObject(arg0).continue();
    }, arguments) };
    imports.wbg.__wbg_continue_596ce84050a38607 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).continue(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbCursorWithValue_db34d99fceacebf2 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof IDBCursorWithValue;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_value_9c378f71b95e0d09 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbDatabase_8ab42e0cd6d7c2b5 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof IDBDatabase;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_close_7b93dd220466550b = function(arg0) {
        getObject(arg0).close();
    };
    imports.wbg.__wbg_createObjectStore_4a32075efdbb541a = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).createObjectStore(getStringFromWasm0(arg1, arg2), getObject(arg3));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_transaction_1acb772a2abd067c = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).transaction(getObject(arg1), takeObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_open_23fa371b93df057e = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2), arg3 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_count_0ef5a917dfe02059 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).count(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAll_dcaa3bbbfc4dd086 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getAll(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAllKeys_803114bd1811736d = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getAllKeys(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_openCursor_1376637b83be8303 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).openCursor();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_openCursor_577d507a3a37864f = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).openCursor(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_openCursor_bbdb07b5ccc60515 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).openCursor(getObject(arg1), takeObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_bound_2290c3bb0f173872 = function() { return handleError(function (arg0, arg1) {
        const ret = IDBKeyRange.bound(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_only_aff7d5ef4aa1fd8b = function() { return handleError(function (arg0) {
        const ret = IDBKeyRange.only(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_add_638b7ab69aae5234 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).add(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_clear_536e8be45645ca1f = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).clear();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_count_0b0a589b26cb70b8 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).count();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createIndex_f5703751911dab93 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
        const ret = getObject(arg0).createIndex(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4), getObject(arg5));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createIndex_dfc5b8f31289fab8 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        const ret = getObject(arg0).createIndex(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_delete_e479451d5dfd2092 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).delete(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getAll_c8d819cf114ed4ac = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).getAll();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_index_3a8e657fa88a7609 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).index(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_put_4fbbdc155efb7fe1 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).put(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setonupgradeneeded_d45cd549b96620ca = function(arg0, arg1) {
        getObject(arg0).onupgradeneeded = getObject(arg1);
    };
    imports.wbg.__wbg_result_f08901cebc40cfb3 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).result;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_error_689730bcb46340d2 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).error;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_transaction_1e0298fb1fe6af35 = function(arg0) {
        const ret = getObject(arg0).transaction;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_setonsuccess_edf62e3126a6a3cd = function(arg0, arg1) {
        getObject(arg0).onsuccess = getObject(arg1);
    };
    imports.wbg.__wbg_setonerror_e3cc3b2d33184c90 = function(arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    };
    imports.wbg.__wbg_instanceof_IdbTransaction_451c7445f35646ea = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof IDBTransaction;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_setonabort_a02e96b4d607da37 = function(arg0, arg1) {
        getObject(arg0).onabort = getObject(arg1);
    };
    imports.wbg.__wbg_objectStore_dc55152fd09cb6a1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).objectStore(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_IdbVersionChangeEvent_3b6249b556504640 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof IDBVersionChangeEvent;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_oldVersion_5ce00c9adea1d997 = function(arg0) {
        const ret = getObject(arg0).oldVersion;
        return ret;
    };
    imports.wbg.__wbg_newVersion_cde0b0a7e668cb9f = function(arg0, arg1) {
        const ret = getObject(arg1).newVersion;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_instanceof_MessageEvent_38cc16e9af008907 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof MessageEvent;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_data_b925af95c51f13e6 = function(arg0) {
        const ret = getObject(arg0).data;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_postMessage_5d2f9130da322a44 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).postMessage(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_start_7082f8930eea39d8 = function(arg0) {
        getObject(arg0).start();
    };
    imports.wbg.__wbg_now_d34ebf05c561b45f = function(arg0) {
        const ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_getReader_2bc7c8965aa15229 = function(arg0) {
        const ret = getObject(arg0).getReader();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_ReadableStreamDefaultReader_d655e53eb62b92da = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ReadableStreamDefaultReader;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_read_6f1b4d1f4ff03f69 = function(arg0) {
        const ret = getObject(arg0).read();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_headers_d9a97819cdde7ed0 = function(arg0) {
        const ret = getObject(arg0).headers;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithstrandinit_8389fb2b668d152e = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Response_e1b11afbefa5b563 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Response;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_status_a0ac881822a339b3 = function(arg0) {
        const ret = getObject(arg0).status;
        return ret;
    };
    imports.wbg.__wbg_headers_b68448ab9872b39f = function(arg0) {
        const ret = getObject(arg0).headers;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_body_f1ceadb79ff61505 = function(arg0) {
        const ret = getObject(arg0).body;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_arrayBuffer_ab97f22c8df098d0 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).arrayBuffer();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_text_ccacf02cce78b4b3 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).text();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_port_f02399b9a0f85c5c = function(arg0) {
        const ret = getObject(arg0).port;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_f31ca9caea276543 = function() { return handleError(function (arg0, arg1) {
        const ret = new SharedWorker(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_protocol_69cc1e60c5d94c83 = function(arg0, arg1) {
        const ret = getObject(arg1).protocol;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_new_3c9b57a1a6e8f1df = function() { return handleError(function (arg0, arg1) {
        const ret = new URL(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getDevices_8b42b647d125418a = function(arg0) {
        const ret = getObject(arg0).getDevices();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_requestDevice_42566753590ea28a = function(arg0, arg1) {
        const ret = getObject(arg0).requestDevice(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_UsbDevice_0608dc5a58c63e6c = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof USBDevice;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_vendorId_bdf2422061433a00 = function(arg0) {
        const ret = getObject(arg0).vendorId;
        return ret;
    };
    imports.wbg.__wbg_productId_36e56c9fbc26e01f = function(arg0) {
        const ret = getObject(arg0).productId;
        return ret;
    };
    imports.wbg.__wbg_serialNumber_bf26ad9b9b2ff511 = function(arg0, arg1) {
        const ret = getObject(arg1).serialNumber;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_opened_e961abbbf91abd29 = function(arg0) {
        const ret = getObject(arg0).opened;
        return ret;
    };
    imports.wbg.__wbg_claimInterface_66b57c06274f4316 = function(arg0, arg1) {
        const ret = getObject(arg0).claimInterface(arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_open_540be697bb2770c2 = function(arg0) {
        const ret = getObject(arg0).open();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_reset_a14fdf39df5dcb81 = function(arg0) {
        const ret = getObject(arg0).reset();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_selectConfiguration_4b2624620f07ffb0 = function(arg0, arg1) {
        const ret = getObject(arg0).selectConfiguration(arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_transferIn_d88fd42da84bacc7 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).transferIn(arg1, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_transferOut_3fd9e3dc2870b441 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).transferOut(arg1, getArrayU8FromWasm0(arg2, arg3));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_UsbInTransferResult_23059baee1b8bf7c = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof USBInTransferResult;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_data_eca876572540a5a7 = function(arg0) {
        const ret = getObject(arg0).data;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_readyState_c80daf859dabc081 = function(arg0) {
        const ret = getObject(arg0).readyState;
        return ret;
    };
    imports.wbg.__wbg_setonopen_1e70ed863e4ea567 = function(arg0, arg1) {
        getObject(arg0).onopen = getObject(arg1);
    };
    imports.wbg.__wbg_setonerror_8038d4efea6560f2 = function(arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    };
    imports.wbg.__wbg_setonclose_c74079f2978a86cd = function(arg0, arg1) {
        getObject(arg0).onclose = getObject(arg1);
    };
    imports.wbg.__wbg_setonmessage_3d1ba3c53e82ba86 = function(arg0, arg1) {
        getObject(arg0).onmessage = getObject(arg1);
    };
    imports.wbg.__wbg_setbinaryType_d2be47b7118c075d = function(arg0, arg1) {
        getObject(arg0).binaryType = takeObject(arg1);
    };
    imports.wbg.__wbg_new_ac1b7ff8270166ee = function() { return handleError(function (arg0, arg1) {
        const ret = new WebSocket(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_close_a9abc75effb4c490 = function() { return handleError(function (arg0) {
        getObject(arg0).close();
    }, arguments) };
    imports.wbg.__wbg_close_a128769dff2d8d44 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).close(arg1);
    }, arguments) };
    imports.wbg.__wbg_close_c2d3c830d3334a5f = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).close(arg1, getStringFromWasm0(arg2, arg3));
    }, arguments) };
    imports.wbg.__wbg_send_93b833d16494a7f2 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_send_6bd7cb876fc36320 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_indexedDB_4e0e5cd2ff353c3d = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).indexedDB;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_clearTimeout_ced4b7cdc5047db5 = function(arg0, arg1) {
        getObject(arg0).clearTimeout(arg1);
    };
    imports.wbg.__wbg_fetch_e69b615150602ff0 = function(arg0, arg1) {
        const ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setTimeout_6fc442f200fd3bd2 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_instanceof_WorkerGlobalScope_f191ca0158f5637b = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof WorkerGlobalScope;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_indexedDB_180703fd6f2a9173 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).indexedDB;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_clearTimeout_1dcd2bd3934c27ec = function(arg0, arg1) {
        getObject(arg0).clearTimeout(arg1);
    };
    imports.wbg.__wbg_fetch_3799090768ed0b48 = function(arg0, arg1) {
        const ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setTimeout_efc5f25b290dda27 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_error_74fe20b2819fce32 = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_info_e74da010412e0ed1 = function(arg0) {
        console.info(getObject(arg0));
    };
    imports.wbg.__wbg_log_00fe3b9721f7fdaf = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg_next_526fc47e980da008 = function(arg0) {
        const ret = getObject(arg0).next;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_1ff1d729e9aae938 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_5f4faef6c12b79ec = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_1d39714405582d3c = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_651f05c6a0944d1c = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newnoargs_581967eacc0e2604 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_cb65541d95d71282 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_get_44be0491f933a435 = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_fff51ee6522a1a18 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new_898a68150f225f2e = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_56693dbed0c32988 = function() {
        const ret = new Map();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_ddb3312ca1c4e32a = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_done_5c1f01fb660d73b5 = function(arg0) {
        const ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_value_1695675138684bd5 = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_iterator_97f0c81209c6c35a = function() {
        const ret = Symbol.iterator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_97b561fb56f034b5 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_b51585de1b234aff = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_502d29070ea18557 = function(arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    };
    imports.wbg.__wbg_from_d7c216d4616bb368 = function(arg0) {
        const ret = Array.from(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_forEach_c4a9c2a1e9a630ba = function(arg0, arg1, arg2) {
        try {
            var state0 = {a: arg1, b: arg2};
            var cb0 = (arg0, arg1, arg2) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_409(a, state0.b, arg0, arg1, arg2);
                } finally {
                    state0.a = a;
                }
            };
            getObject(arg0).forEach(cb0);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_isArray_4c24b343cb13cfb1 = function(arg0) {
        const ret = Array.isArray(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_push_ca1c26067ef907ac = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_slice_451215f026ccac3a = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).slice(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_39ac22089b74fddb = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ArrayBuffer;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_buffer_f0725de62cca9287 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_byteLength_e5a98412a3701374 = function(arg0) {
        const ret = getObject(arg0).byteLength;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Error_ab19e20608ea43c7 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Error;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_new_d258248ed531ff54 = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_message_48bacc5ea57d74ee = function(arg0) {
        const ret = getObject(arg0).message;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_name_8f734cbbd6194153 = function(arg0) {
        const ret = getObject(arg0).name;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_01734de55d61e11d = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_4c92f6aec1e1d6e6 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2), getObject(arg3));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_bedc3d02d0f05eb0 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_isSafeInteger_bb8e18dd21c97288 = function(arg0) {
        const ret = Number.isSafeInteger(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_getTime_5e2054f832d82ec9 = function(arg0) {
        const ret = getObject(arg0).getTime();
        return ret;
    };
    imports.wbg.__wbg_getTimezoneOffset_8aee3445f323973e = function(arg0) {
        const ret = getObject(arg0).getTimezoneOffset();
        return ret;
    };
    imports.wbg.__wbg_new0_c0be7df4b6bd481f = function() {
        const ret = new Date();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_9c5990bda04c7e53 = function() {
        const ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_instanceof_Object_3daa8298c86298be = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Object;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_entries_e51f29c7bba0c054 = function(arg0) {
        const ret = Object.entries(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_is_205d914af04a8faa = function(arg0, arg1) {
        const ret = Object.is(getObject(arg0), getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_toString_a8e343996af880e9 = function(arg0) {
        const ret = getObject(arg0).toString();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_has_c5fcd020291e56b8 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.has(getObject(arg0), getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_092e06b0f9d71865 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_buffer_085ec1f694018c4f = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_43f1b47c28813cbd = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_484(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_resolve_53698b95aaf7fcf8 = function(arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_f7e06ee3c11698eb = function(arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_b2267541e2a73865 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_6da8e527659b86aa = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_8125e318e6245eed = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_5cf90238115182c3 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_72e2208bbc0efc61 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_d8d9cb2b8e8ac1d4 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Uint8Array;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_newwithlength_e5d69174d6984cd7 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_subarray_13db269f57aa838d = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_3be0060ee67b0073 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_e1edba75c269bb52 = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_ab848069a8f78a33 = function(arg0) {
        const ret = getObject(arg0).getRandomValues;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_62b34c9aa7eee5c0 = function(arg0, arg1) {
        const ret = require(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_97f3930c7993a7dc = function(arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_getRandomValues_2e09c95e7227d117 = function(arg0, arg1, arg2) {
        getObject(arg0).getRandomValues(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper12601 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 2785, __wbg_adapter_38);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper12603 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 2785, __wbg_adapter_38);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper12605 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 2785, __wbg_adapter_38);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper12607 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 2785, __wbg_adapter_38);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper30886 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 8745, __wbg_adapter_47);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper31108 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 8795, __wbg_adapter_50);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper31498 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 8877, __wbg_adapter_53);
        return addHeapObject(ret);
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedFloat64Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint32Memory0 = null;
    cachedUint8Memory0 = null;


    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('kdflib_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;
