#!/bin/sh
# Copy static assets to shared volume
echo "Syncing static assets..."
mkdir -p /app/public_html/ui-ux
cp -r /app/dist/. /app/public_html/
cp -r /app/ui-ux/. /app/public_html/ui-ux/
echo "Static assets synced."

# Start the server
exec node server.js
