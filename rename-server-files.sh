#!/bin/bash

# Get into the dist/server directory
cd dist/sc-www/server

# Rename files replacing ".server" with "_server"
for file in *.server.mjs; do
    NEWFILE="$(basename "$file" .server.mjs)_server.mjs"
    mv "$file" "${NEWFILE}"
    sed -i "s/$(basename "$file")/${NEWFILE}/g" *.mjs
done
