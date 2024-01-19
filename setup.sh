#!/bin/bash

# Check & Install bun
if command -v bun &> /dev/null ; then
    echo "bun is installed."
else
    echo "bun is not installed."
    echo "installing bun."
    curl -fsSL https://bun.sh/install | bash 

    # add to ~/.zshrc or ~/.bashrc
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
fi

# Install/build
bun install

# Changing PWD to download geojson data using curl
mkdir server/geojson-data &> /dev/null
cd server/geojson-data

curl -Lo INDIA_DISTRICT.geojson "https://github.com/datta07/INDIAN-SHAPEFILES/raw/master/INDIA/INDIA_DISTRICTS.geojson"
curl -Lo INDIA_SUBDISTRICT.geojson "https://github.com/datta07/INDIAN-SHAPEFILES/raw/master/INDIA/INDIAN_SUB_DISTRICTS.geojson"
curl -Lo INDIA_STATE.geojson "https://github.com/datta07/INDIAN-SHAPEFILES/raw/master/INDIA/INDIA_STATES.geojson"

# Changing PWD back to project root
cd - &> /dev/null