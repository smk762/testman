#!/bin/bash
if [ ! -e config/coins ] || [ $(find config/coins -mtime -3 | wc -l) -gt 0 ]; then
    cd config
    wget https://raw.githubusercontent.com/KomodoPlatform/coins/master/coins
    cp coins ../tcp/coins
    cp coins ../wasm_rpc/coins
    cp coins ../newman/coins
    cd ..
fi

# Start the services
docker compose up -d kdf-tcp kdf-tcp-hd kdf-wasm kdf-wasm-hd nginx reown-wc

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
docker compose up newman

# Capture the exit code
EXIT_CODE=$?

# Shut down all services
echo "Tests completed with exit code $EXIT_CODE. Shutting down services..."
docker compose down

# Exit with the same code as the tests
exit $EXIT_CODE
