#!/usr/bin/env bash
# build.sh — Construye el sitio Astro e indexa la búsqueda con Pagefind.
set -e

echo "🔨 Construyendo el sitio..."
pnpm build

echo "🔍 Indexando búsqueda (Pagefind)..."
pnpm pagefind --site dist

echo "✅ Listo. Archivos en /dist"
