#! /bin/bash

update_env_var() {
    local key=$1
    local value=$2
    if grep -q "^${key}=" .env; then
        sed -i "s/^${key}=.*/${key}=${value}/" .env
    else
        echo "${key}=${value}" >>.env
    fi
}

update_env_var "USER_ID" "$(id -u)"
update_env_var "GROUP_ID" "$(id -g)"
