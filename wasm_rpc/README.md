# RPC interface for wasm version of Komodo DeFi Framework

This project helps create a simple RPC interface for the wasm version of Komodo DeFi Framework. It allows you to send RPC requests to the KDF's wasm lib running in a web browser and get the response

## Setup

1. Clone the repository

```bash
git clone https://github.com/KomodoPlatform/komodefi-wasm-rpc
```

2. Install nvm, node and yarn

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# Restart your terminal after installing nvm
# Or follow instructions at https://github.com/nvm-sh/nvm#install--update-script
nvm install 18
npm install -g yarn
```

3. Install dependencies, set environment variables and update MM2.json

```bash
cd komodefi-wasm-rpc
yarn install --frozen-lockfile
cp .env.example .env
cp MM2_example.json MM2.json
```

- Run the `setup.sh` script to set the group and user id variables in the .env file
- Change the port values in the `.env` file if necessary, the `VITE_WASM_BIN` value will be set automatically when updating the wasm lib using the `update_wasm.sh` script. the `VITE_LOGS_LIMIT` value will determine how many logs will be stored in the servers's memory. the `MM2_LOG_FILE` value will determine the log file name
- Update the MM2.json file with the appropriate values

## Usage with docker

Run the following command to start the docker container

```bash
docker compose up
```

- It will start a web socket server at ws://localhost:7777/ (typically don't need to care about this)
- It will start a rpc server at http://localhost:7783/ and listens for POST requests at http://localhost:7783/rpc

If you update the kdf wasm lib, restart the docker container for the changes to take effect:

```bash
docker compose down && docker compose up
```

## Usage without docker

1. Run the RPC and WebSocket server

```bash
node server.cjs
```

- It will start a web socket server at ws://localhost:7777/ (typically don't need to care about this)
- It will start a rpc server at http://localhost:7783/ and listens for POST requests at http://localhost:7783/rpc

2. Run the server for KDF's wasm lib

```bash
yarn preview
```

- It will create a simple site with the wasm lib running at http://localhost:3000/
- The site will connect to the WebSocket server running at ws://localhost:7777/ and wait for RPC requests

3. Visit the site at http://localhost:3000/

## Sending a request (POST)

A curl request will look like this:

```bash
curl http://localhost:7783/rpc -d '{"userpass": "RPC_UserP@SSW0RD", "method": "version"}'
```

## Update coins file

Update the coins file by running the following command. It just needs a url that has a coins json in valid format

```bash
./update_coins.sh https://raw.githubusercontent.com/KomodoPlatform/coins/master/coins
```

If you have a coins array in MM2.json, the kdf wasm lib will use that instead of using the coins file downloaded from this script

## Update the wasm lib based on url

```bash
./update_wasm.sh https://sdk.devbuilds.komodo.earth/dev/kdf_e65fefe-wasm.zip
```

It just needs a url that has a wasm lib in valid format

## Update the wasm lib based on local file

```bash
./update_wasm_local.sh ~/Downloads/kdf_e65fefe-wasm.zip
```

## Misc features

### Update the wasm lib (POST)

```bash
curl http://localhost:7783/admin -d '{
  "action": "update_wasm_lib",
  "wasm_lib_url": "https://sdk.devbuilds.komodo.earth/dev/kdf_e65fefe-wasm.zip"
}'
```

### Reload the page running the KDF lib (POST)

Use the `reload_kdf_page` action to reload the page running the wasm lib

```bash
curl http://localhost:7783/admin -d '{
  "action": "reload_kdf_page"
}'
```

Send the `mm2_conf` param and/or `coins_json_url` param in addition to use a custom MM2 configuration and coins file. Fetching the coins file must return a json with a valid coins array

```bash
curl http://localhost:7783/admin -d '{
  "action": "reload_kdf_page",
  "mm2_conf": {
    "gui": "MM2_WASM_RPC_TESTER",
    "mm2": 1,
    "passphrase": "wasmtest1",
    "allow_weak_password": true,
    "rpc_password": "RPC_UserP@SSW0RD",
    "netid": 8762
  },
  "coins_json_url": "https://raw.githubusercontent.com/KomodoPlatform/coins/cosmos/coins"
}'
```

### Restart the KDF lib on the same page (POST)

```bash
curl http://localhost:7783/admin -d '{
  "action": "restart_kdf"
}'
```

```bash
curl http://localhost:7783/admin -d '{
  "action": "restart_kdf",
  "mm2_conf": {
    "gui": "MM2_WASM_RPC_TESTER",
    "mm2": 1,
    "passphrase": "wasmtest1",
    "allow_weak_password": true,
    "rpc_password": "RPC_UserP@SSW0RD",
    "netid": 8762
  },
  "coins_json_url": "https://raw.githubusercontent.com/KomodoPlatform/coins/solana/coins"
}'
```

### Get logs (GET)

`/logs` endpoint returns the logs in the server's memory, it has a `limit` query param which determines how many logs will be returned. If no limit is provided, it will return all logs (up to the limit set in the .env file)

```bash
curl http://localhost:7783/logs?limit=100
```

logs are also written to `mm2.log` ( or the value of `MM2_LOG_FILE` in the .env file ) file in the root directory and it can be tailed to get the logs in real time

### Know status (GET)

```bash
curl http://localhost:7783/status
```


## Notes
For sequencing requests, and awaiting a response value before continuing, refer to https://chatgpt.com/share/67c6ba58-f198-800d-8176-0bd9e087594c
