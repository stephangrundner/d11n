#!/usr/bin/env bash
# Downloads and installs the draw.io webapp into frontend/public/drawio/.
# The webapp is served locally so the diagram editor runs offline.
# Usage: ./scripts/setup-drawio.sh [version]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="$SCRIPT_DIR/../frontend/public/drawio"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Resolve version: use argument, or fetch latest from GitHub API
if [[ "${1-}" != "" ]]; then
  VERSION="$1"
else
  echo "Fetching latest draw.io release version..."
  VERSION=$(curl -fsSL https://api.github.com/repos/jgraph/drawio/releases/latest \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['tag_name'].lstrip('v'))")
fi

echo "Installing draw.io v${VERSION} → ${DEST}/"
mkdir -p "$DEST"

# Download WAR (contains the full static webapp)
echo "Downloading draw.war..."
curl -fsSL \
  "https://github.com/jgraph/drawio/releases/download/v${VERSION}/draw.war" \
  -o "$TMP/draw.war"

echo "Extracting..."
cd "$TMP" && unzip -q draw.war

# Copy only what the webapp needs for embed mode on a non-draw.io domain:
# bootstrap.js loads: PreConfig.js → app.min.js → PostConfig.js
# CSS, images, and mxgraph (shapes) are also required.
mkdir -p "$DEST/js" "$DEST/styles" "$DEST/mxgraph"

cp "$TMP/index.html"                   "$DEST/"
cp "$TMP/favicon.ico"                  "$DEST/" 2>/dev/null || true
cp "$TMP/js/bootstrap.js"             "$DEST/js/"
cp "$TMP/js/main.js"                  "$DEST/js/"
cp "$TMP/js/app.min.js"               "$DEST/js/"
cp "$TMP/js/PreConfig.js"             "$DEST/js/"
cp "$TMP/js/PostConfig.js"            "$DEST/js/"
cp "$TMP/js/stencils.min.js"          "$DEST/js/"
cp "$TMP/js/extensions.min.js"        "$DEST/js/"
cp "$TMP/js/shapes-14-6-5.min.js"     "$DEST/js/"

cp -r "$TMP/styles/"    "$DEST/styles/"
cp -r "$TMP/math4/"    "$DEST/math4/"   2>/dev/null || true
cp -r "$TMP/mxgraph/"  "$DEST/mxgraph/"
cp -r "$TMP/resources/" "$DEST/resources/"
cp -r "$TMP/images/"   "$DEST/images/"  2>/dev/null || true
cp -r "$TMP/img/"      "$DEST/img/"     2>/dev/null || true

echo "Done. draw.io v${VERSION} installed at frontend/public/drawio/"
echo "Approximate size: $(du -sh "$DEST" | cut -f1)"
