#!/usr/bin/env bash
# build.sh — Construye el sitio Astro e indexa la búsqueda con Pagefind.
set -e

echo "📎 Copiando attachments..."
cp -r src/content/blog/attachments/. public/images/

echo "🔨 Construyendo el sitio..."
astro build
echo "🔍 Indexando búsqueda (Pagefind)..."
pnpm pagefind --site dist

echo "✅ Listo. Archivos en /dist"
