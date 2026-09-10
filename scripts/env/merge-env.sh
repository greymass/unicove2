#!/usr/bin/env bash
set -euo pipefail

SOURCE="$1"
TARGET="$2"

while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
        echo "$line"
        continue
    fi

    var_name="${line%%=*}"

    if [[ -n "${!var_name+x}" ]]; then
        echo "$var_name=\"${!var_name}\""
    else
        echo "$line"
    fi
done < "$SOURCE" > "$TARGET"
