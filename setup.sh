mkdir ./src/geojson-data

is_wget2_installed() {
    if command -v wget2 &> /dev/null; then
        return 0  # wget2 is installed
    else
        return 1  # wget2 is not installed
    fi
}

if is_wget2_installed; then
    echo "wget2 is already installed."
else
    # Check if the OS is macOS or Linux
    if [[ "$(uname)" == "Darwin" ]]; then
        echo "macOS detected. Installing wget2 using Homebrew..."
        # Check if Homebrew is installed, if not install it
        if ! command -v brew &> /dev/null; then
            echo "Homebrew not found. Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        # Install wget2 using Homebrew
        brew install wget
    elif [[ "$(uname)" == "Linux" ]]; then
        echo "Linux detected. Installing wget2 using apt..."
        # Update package list and install wget2 using apt
        sudo apt update
        sudo apt install wget2 -y
    else
        echo "Unsupported OS detected."
        exit 1
    fi
fi

# curl -o ./db.mmdb -L --fail --compressed https://mmdbcdn.posthog.net
# getting the latest db.mmdb
wget2 -O db.mmdb https://mmdbcdn.posthog.net

cd ./src

#git clone --depth=1 "https://github.com/35C4n0r/geoquery.in.data" geojson-data
#cp -r /d/Jay/C4GT/Selected/geoquery.in.data/* ./geojson-data
cd geojson-data
rm -rf .git .gitattributes

#mv ./geojson-data/* .
#rmdir ./geojson-data

# Moving db.mmdb to project root
#mv ./db.mmdb ../../db.mmdb

curl -Lo INDIA_DISTRICT.geojson "https://github.com/datta07/INDIAN-SHAPEFILES/raw/master/INDIA/INDIA_DISTRICTS.geojson"
curl -Lo INDIA_SUBDISTRICT.geojson "https://github.com/datta07/INDIAN-SHAPEFILES/raw/master/INDIA/INDIAN_SUB_DISTRICTS.geojson"
curl -Lo INDIA_STATE.geojson "https://github.com/datta07/INDIAN-SHAPEFILES/raw/master/INDIA/INDIA_STATES.geojson"

# This JSON contains state > districts > subDistricts > villages for all states
curl -Lo MASTER_LOCATION_NAMES.json "https://github.com/pranshumaheshwari/indian-cities-and-villages/raw/master/data.json"

# village boundary
git clone --depth=1 https://github.com/datameet/indian_village_boundaries.git
# indian_village_boundaries repo cleanup
cd indian_village_boundaries
rm -rf .git docs website CONTRIBUTING.md LICENSE README.md
# Renaming states dir
mv ./br ./bihar
mv ./ga ./goa
mv ./gj ./gujarat
mv ./ka ./karnataka
mv ./kl ./kerala
mv ./mh ./maharashtra
mv ./or ./odisha
mv ./rj ./rajasthan
mv ./sk ./sikkim

# Changing PWD back to /src/
cd ../..

# Updating geoJSON files through script to make them usable in src
cd ./scripts
npx ts-node parse.geojson.ts
npx ts-node ingestors/state.geojson.ts
npx ts-node ingestors/district.geojson.ts
npx ts-node ingestors/subdistrict.geojson.ts