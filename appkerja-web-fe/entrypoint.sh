#!/bin/sh
set -e

if [ ! -f package-lock.json ]; then
  echo "package-lock.json not found, skipping npm ci"
else
  if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null || true)" ]; then
    echo "Installing dependencies (npm ci)..."
    npm ci
  else
    echo "node_modules already exists, skipping npm ci"
  fi
fi

mkdir -p .nuxt

echo "Starting Nuxt dev server..."
exec "$@"