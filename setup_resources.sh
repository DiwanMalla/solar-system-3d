#!/bin/bash
mkdir -p textures

BASE_URL="https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images"

# Function to download with fallback
download_texture() {
    name=$1
    remote_name=$2
    local_name=$3
    
    echo "Downloading $name..."
    curl -f -L -o "textures/$local_name" "$BASE_URL/$remote_name" || echo "Failed to download $name"
}

download_texture "Sun" "sunmap.jpg" "sun.jpg"
download_texture "Mercury" "mercurymap.jpg" "mercury.jpg"
download_texture "Venus" "venusmap.jpg" "venus.jpg"
download_texture "Earth" "earthmap1k.jpg" "earth.jpg"
download_texture "Earth Clouds" "earthcloudmap.jpg" "earth_clouds.jpg"
download_texture "Moon" "moonmap1k.jpg" "moon.jpg"
download_texture "Mars" "marsmap1k.jpg" "mars.jpg"
download_texture "Jupiter" "jupitermap.jpg" "jupiter.jpg"
download_texture "Saturn" "saturnmap.jpg" "saturn.jpg"
download_texture "Saturn Ring" "saturnringcolor.jpg" "saturn_ring.jpg"
download_texture "Uranus" "uranusmap.jpg" "uranus.jpg"
download_texture "Uranus Ring" "uranusringcolor.jpg" "uranus_ring.jpg"
download_texture "Neptune" "neptunemap.jpg" "neptune.jpg"
download_texture "Pluto" "plutomap1k.jpg" "pluto.jpg"

echo "Texture download complete."
