#!/usr/bin/env bash
# One-time setup to bootstrap Let's Encrypt certs for the prod stack.
# nginx refuses to start without certs at the paths it's configured for, so this
# script seeds a dummy self-signed cert, brings nginx up to serve the ACME
# challenge, swaps in the real cert from Let's Encrypt, then reloads nginx.
set -euo pipefail

# DOMAIN and EMAIL env variables removed. Set these elsewhere.

COMPOSE="docker compose -f docker-compose.prod.yml"
CERTS_PATH="/etc/letsencrypt/live/$DOMAIN"

echo "### Creating dummy certificate for $DOMAIN ..."
$COMPOSE run --rm --entrypoint "\
  sh -c 'mkdir -p $CERTS_PATH && \
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout $CERTS_PATH/privkey.pem \
    -out $CERTS_PATH/fullchain.pem \
    -subj \"/CN=localhost\"'" certbot

echo "### Starting nginx ..."
$COMPOSE up --force-recreate -d client

echo "### Deleting dummy certificate for $DOMAIN ..."
$COMPOSE run --rm --entrypoint "\
  sh -c 'rm -rf /etc/letsencrypt/live/$DOMAIN && \
  rm -rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf'" certbot

echo "### Requesting real certificate for $DOMAIN ..."
$COMPOSE run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL -d $DOMAIN \
    --rsa-key-size 2048 --agree-tos --no-eff-email" certbot

echo "### Reloading nginx ..."
$COMPOSE exec client nginx -s reload
