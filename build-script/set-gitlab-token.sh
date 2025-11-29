#!/usr/bin/env bash

scriptDir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
configDir=$scriptDir/../config

source $configDir/.env

retry_count=0
max_retries=30
while [ $retry_count -lt $max_retries ]; do
    GITLAB_API_TOKEN=$(aws secretsmanager get-secret-value --secret-id opa-admin-gitlab-secrets --output text --query 'SecretString' | jq -r '.apiToken')
    if [[ -z "$GITLAB_API_TOKEN" || "$GITLAB_API_TOKEN" == "null" ]]; then
        retry_count=$((retry_count + 1))
        echo "Empty Gitlab API token, retrying... ($retry_count/$max_retries)"
        sleep 10
    else
        break
    fi
done

sed -i.bak "s/^\(SECRET_GITLAB_CONFIG_PROP_apiToken=\).*$/\1\"$GITLAB_API_TOKEN\"/g" ./config/.env && rm -f ./config/.env.bak