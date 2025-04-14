#!/bin/bash

cd /home/komodian/kdf/
RPC_PORT=$(cat MM2.json | jq -r '.rpcport')
USERPASS=$(cat MM2.json | jq -r '.rpc_password')
MM_LOG="/home/komodian/kdf/kdf-wasm-hd.log"
echo "RPC_PORT: ${RPC_PORT}"
echo "USERPASS: ${USERPASS}"
echo "VITE_WS_PORT: ${VITE_WS_PORT}"
echo "VITE_RPC_PORT: ${VITE_RPC_PORT}"
echo "VITE_WEB_PORT: ${VITE_WEB_PORT}"
yarn install --frozen-lockfile && pm2-runtime ecosystem.config.cjs
