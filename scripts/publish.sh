#!/bin/sh

set -e

pnpm i --frozen-lockfile

pnpm build

cd packages/vite

pnpm publish --force

cd -

echo "✅ Publish completed"
