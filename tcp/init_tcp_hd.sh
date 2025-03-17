#!/bin/bash

cd /home/komodian/kdf/
cp KDF_tcp_hd.json MM2.json
RPC_PORT=$(cat MM2.json | jq -r '.rpcport')
USERPASS=$(cat MM2.json | jq -r '.rpc_password')
echo "RPC_PORT: ${RPC_PORT}"
echo "USERPASS: ${USERPASS}"
kdf > $MM_LOG &
sleep 5
curl --url "kdf-tcp-hd:${RPC_PORT}" --data "{\"method\":\"version\",\"userpass\":\"$USERPASS\"}"
echo ""
sleep 5
tail -f $MM_LOG
