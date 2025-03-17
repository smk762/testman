// Use ES module import syntax to import functionality from the module
// that we have compiled.
//
// Note that the `default` import is an initialization function which
// will "boot" the module and make it ready to use.
// Currently, browsers don't support natively imported WebAssembly as an ES module, but
// eventually the manual initialization won't be required!
import mm2_conf from '../MM2.json';
import init, {
  LogLevel,
  MainStatus,
  Mm2MainErr,
  Mm2RpcErr,
  mm2_main,
  mm2_main_status,
  mm2_rpc,
  mm2_stop,
  mm2_version,
} from './kdflib.js';

/////////////WSS stuff
const wsUri = `ws://localhost:${import.meta.env.VITE_WS_PORT}`;

const connectionStatusDiv = document.getElementById('connection-status');
const outputDiv = document.getElementById('output');
const errorDiv = document.getElementById('error');

let websocket;

async function connectWs() {
  websocket = new WebSocket(wsUri);

  websocket.onopen = function (event) {
    connectionStatusDiv.textContent = 'Connected to server!';
  };

  websocket.onmessage = async function (event) {
    const receivedMessage = event.data;
    const receivedMessageObj = JSON.parse(receivedMessage);
    if (receivedMessageObj.action && receivedMessageObj.action === 'restart_kdf') {
      await STOP_MM2();
      if (receivedMessageObj.mm2_conf) {
        const conf_js = await checkAndAddCoins(
          receivedMessageObj.mm2_conf,
          receivedMessageObj.coins_json_url,
        );
        await START_MM2(JSON.stringify(conf_js));
      } else {
        const conf_js = await checkAndAddCoins(mm2_conf);
        await START_MM2(JSON.stringify(conf_js));
      }
      sendWsMessage(
        { action: 'restart_kdf', response: 'success', uuid: receivedMessageObj.uuid },
        receivedMessageObj.uuid,
      );
    } else if (receivedMessageObj.message && receivedMessageObj.uuid) {
      // outputDiv.textContent = "Received: " + JSON.stringify(JSON.parse(receivedMessage)) + "";
      // outputDiv.textContent = JSON.stringify(request_js);
      const response = await RPC_REQUEST(receivedMessageObj.message);
      sendWsMessage(response, receivedMessageObj.uuid);
    }
  };

  websocket.onerror = function (event) {
    if (event.error) {
      errorDiv.textContent = 'Error: ' + event.error + '';
    } else {
      errorDiv.textContent = 'Error: ws server might be down';
    }
  };

  websocket.onclose = function (event) {
    connectionStatusDiv.textContent = 'Connection closed.';
  };
}

function sendWsMessage(message, uuid) {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({ message: message, uuid: uuid }));
  } else {
    errorDiv.textContent = 'Error: Connection not open.';
  }
}

///////////////////

const LOG_LEVEL = LogLevel.Info;

const LogArray = [];

// const LogArrayProxy = new Proxy(LogArray, {
//   set: function (target, property, value) {
//     target[property] = value;
//     if (websocket && websocket.readyState === WebSocket.OPEN) {
//       websocket.send(JSON.stringify({ logObject: value }));
//     }
//     return true;
//   }
// });

// Loads the wasm file, so we use the
// default export to inform it where the wasm file is located on the
// server, and then we wait on the returned promise to wait for the
// wasm to be loaded.
async function init_wasm() {
  try {
    await init(`/${import.meta.env.VITE_WASM_BIN}`);
    return 'WASM lib initialized';
  } catch (e) {
    return `Error on 'init_wasm': ${e}`;
  }
}

async function run_mm2(params) {
  // run an MM2 instance
  try {
    const version = mm2_version();
    console.info(`run_mm2() version=${version.result} datetime=${version.datetime}`);

    mm2_main(params, handle_log);
  } catch (e) {
    switch (e) {
      case Mm2MainErr.AlreadyRuns:
        return 'MM2 already runs, please wait...';
      case Mm2MainErr.InvalidParams:
        return 'Invalid config';
      case Mm2MainErr.NoCoinsInConf:
        return "No 'coins' field in config";
      default:
        return `Oops: ${e}`;
    }
  }
}

function handle_log(level, line) {
  switch (level) {
    case LogLevel.Off:
      break;
    case LogLevel.Error:
      pushToLimitedArrayAndSendToServer(LogArray, { level: 'error', line: line, time: Date.now() });
      console.error(line);
      break;
    case LogLevel.Warn:
      pushToLimitedArrayAndSendToServer(LogArray, { level: 'warn', line: line, time: Date.now() });
      console.warn(line);
      break;
    case LogLevel.Info:
      pushToLimitedArrayAndSendToServer(LogArray, { level: 'info', line: line, time: Date.now() });
      console.info(line);
      break;
    case LogLevel.Debug:
      pushToLimitedArrayAndSendToServer(LogArray, { level: 'debug', line: line, time: Date.now() });
      console.log(line);
      break;
    case LogLevel.Trace:
    default:
      pushToLimitedArrayAndSendToServer(LogArray, {
        level: 'default',
        line: line,
        time: Date.now(),
      });
      console.debug(line);
      break;
  }
  updateLogs();
}

function spawn_mm2_status_checking() {
  setInterval(function () {
    const run_button = document.getElementById('wid_run_mm2_button');
    const stop_button = document.getElementById('wid_stop_mm2_button');
    const rpc_button = document.getElementById('wid_mm2_rpc_button');

    const status = mm2_main_status();
    switch (status) {
      case MainStatus.NotRunning:
        rpc_button.disabled = true;
        stop_button.disabled = true;
        run_button.disabled = false;
        break;
      case MainStatus.NoContext:
      case MainStatus.NoRpc:
        rpc_button.disabled = true;
        stop_button.disabled = false;
        run_button.disabled = true;
        break;
      case MainStatus.RpcIsUp:
        rpc_button.disabled = false;
        stop_button.disabled = false;
        run_button.disabled = true;
        break;
      default:
        throw new Error(`Expected MainStatus, found: ${status}`);
    }
  }, 100);
}

async function START_MM2(conf) {
  let params;
  try {
    const conf_js = JSON.parse(conf);
    params = {
      conf: conf_js,
      log_level: LOG_LEVEL,
    };
  } catch (e) {
    return `Expected config in JSON, found '${conf}'\nError : ${e}`;
  }
  try {
    await run_mm2(params);
    return 'MM2 started successfully';
  } catch (e) {
    return `Error on 'run_mm2': ${e}`;
  }
}

async function STOP_MM2() {
  try {
    await mm2_stop();
    return 'MM2 stopped';
  } catch (e) {
    return `Error on 'mm2_stop': ${e}`;
  }
}

async function RPC_REQUEST(request_payload) {
  let request_js;
  try {
    request_js = JSON.parse(request_payload);
  } catch (e) {
    return `Error on 'rpc_request': Invalid payload: ${request_payload}, ${e}`;
  }

  try {
    const response = await mm2_rpc(request_js);
    return response;
  } catch (e) {
    switch (e) {
      case Mm2RpcErr.NotRunning:
        return "Error on 'rpc_request':MM2 is not running yet";
      case Mm2RpcErr.InvalidPayload:
        return `Error on 'rpc_request': Invalid payload: ${request_js}`;
      case Mm2RpcErr.InternalError:
        return `Error on 'rpc_request': An MM2 internal error`;
      default:
        return `Error on 'rpc_request':Unexpected error: ${e}`;
    }
  }
}

function pushToLimitedArrayAndSendToServer(arr, item, limit = 1000) {
  if (arr.length >= limit) {
    arr.shift(); // Remove the first element
  }
  arr.push(item);
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({ logObject: item }));
  }
  return arr;
}

function updateLogs() {
  const logsContainer = document.getElementById('logs-container');
  const logsDiv = document.getElementById('logs');
  logsDiv.innerHTML = LogArray.map(
    (log) =>
      `<div class="log-entry ${log.level}"><span class="font-bold">[${log.level.toUpperCase()}]</span> ${log.line}</div>`,
  ).join('');
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

async function checkAndAddCoins(conf_js, coins_json_url) {
  if (!conf_js.coins) {
    let coinsUrl = coins_json_url
      ? coins_json_url
      : new URL(`/coins?cachebuster=${Date.now()}`, window.location.origin);
    let coins = await fetch(coinsUrl);
    let coinsJson = await coins.json();
    conf_js.coins = coinsJson;
  }
  return conf_js;
}

// The script starts here

(async function () {
  const init_wasm_resp = await init_wasm();
  console.log(init_wasm_resp);
  await connectWs();
  const checkConnection = setInterval(() => {
    if (!websocket || websocket.readyState !== WebSocket.OPEN) {
      connectWs();
    }
  }, 1000);
  let conf_js;

  const urlParams = new URLSearchParams(window.location.search);
  const mm2_conf_encoded = urlParams.get('mm2_conf');
  if (mm2_conf_encoded) {
    conf_js = JSON.parse(atob(mm2_conf_encoded));
  } else {
    conf_js = JSON.parse(JSON.stringify(mm2_conf));
  }

  conf_js = await checkAndAddCoins(conf_js);

  const mm2StartResp = await START_MM2(JSON.stringify(conf_js));
  console.log(mm2StartResp);

  const cleanupConnectionCheckAndMM2 = () => {
    clearInterval(checkConnection);
    STOP_MM2();
  };
  window.addEventListener('beforeunload', cleanupConnectionCheckAndMM2);
})();
