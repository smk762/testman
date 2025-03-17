#!/bin/bash

[ ! -d kdf_zips ] && mkdir kdf_zips
cd kdf_zips
fn=${1##*/}
[ ! -f $fn ] && wget $1
mkdir temp
unzip $fn -d temp
cd temp
# if [[ "$OSTYPE" == "darwin"* ]]; then
#     sed -i '' "s|input = new URL('kdflib_bg.wasm', import.meta.url);|input = new URL('kdflib_bg.wasm', process.env.NEXT_PUBLIC_BASE_PATH);|" kdflib.js
# else
#     sed -i "s|input = new URL('kdflib_bg.wasm', import.meta.url);|input = new URL('kdflib_bg.wasm', process.env.NEXT_PUBLIC_BASE_PATH);|" kdflib.js
# fi

mv kdflib.js ../../js/kdflib.js
mv kdflib.d.ts ../../js/kdflib.d.ts
# mv kdflib.wasm.d.ts ../../js/kdflib.wasm.d.ts
rm -rf ../../js/snippets/*
cp -r snippets/* ../../js/snippets/

basename=$(basename "$fn" .zip) # Remove .zip from filename
temp=${basename#*_}
version=${temp%-wasm} # Remove everything up to and including the first underscore
if [ "$2" = "update_default" ]; then
    rm ../../public/*.wasm
fi

mv kdflib_bg.wasm ../../public/kdflib_bg_$version.wasm

cd ..
rm -rf temp
cd ..

# Update only the VITE_WASM_BIN value in the .env file
if grep -q "VITE_WASM_BIN=" .env; then
    sed -i.bak "s/VITE_WASM_BIN=.*/VITE_WASM_BIN=kdflib_bg_$version.wasm/" .env && rm .env.bak
else
    echo "VITE_WASM_BIN=kdflib_bg_$version.wasm" >>.env
fi

# Update .env.example only if the script is called with argument "update_default"
if [ "$2" = "update_default" ]; then
    if grep -q "VITE_WASM_BIN=" .env.example; then
        sed -i.bak "s/VITE_WASM_BIN=.*/VITE_WASM_BIN=kdflib_bg_$version.wasm/" .env.example && rm .env.example.bak
    else
        echo "VITE_WASM_BIN=kdflib_bg_$version.wasm" >>.env.example
    fi
fi
