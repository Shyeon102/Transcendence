#!/bin/sh
set -e

if [ ! -f /etc/nginx/certs/server.crt ]; then
    apk add --no-cache openssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/certs/server.key \
        -out /etc/nginx/certs/server.crt \
        -subj "/CN=localhost"
fi

exec nginx -g "daemon off;"