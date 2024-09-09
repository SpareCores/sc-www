#!/bin/bash

rm -rf ./.amplify-hosting
mkdir -p ./.amplify-hosting/compute
cp -r ./dist/sc-www/server ./.amplify-hosting/compute/default
cp -r ./dist/sc-www/browser ./.amplify-hosting/static
cp -r ./dist/sc-www/browser ./.amplify-hosting/compute/default/static
cp deploy-manifest.json ./.amplify-hosting/deploy-manifest.json
