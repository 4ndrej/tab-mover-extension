#!/usr/bin/env bash
# Zabali rozsirenie do dist/<nazov>-v<verzia>.zip (len subory potrebne na nacitanie
# v Chrome, bez testov/node_modules).
set -euo pipefail
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

VERSION=$(node -p "require('./manifest.json').version")
NAME=$(node -p "require('./package.json').name")
OUT="dist/${NAME}-v${VERSION}.zip"

mkdir -p dist
rm -f "$OUT"
zip -r "$OUT" \
  manifest.json \
  popup.html \
  popup.css \
  popup.js \
  src \
  README.md \
  -x '*.DS_Store'

echo "Vytvorene: $OUT"
