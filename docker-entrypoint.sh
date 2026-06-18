#!/bin/sh
set -e

echo "==> Menjalankan prisma migrate deploy..."
bunx prisma migrate deploy

echo "==> Menjalankan server KostSolo..."
exec bun run src/index.js
