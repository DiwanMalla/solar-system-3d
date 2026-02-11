# 🌌 Solar System 3D Explorer

An interactive 3D visualization of our solar system built with Three.js, featuring all planets with realistic animations, detailed information panels, and a modern UI design.

![Solar System Preview](https://img.shields.io/badge/Three.js-r128-blue) ![Status](https://img.shields.io/badge/Status-Complete-brightgreen)

## ✨ Features

- **Interactive 3D Visualization**: Explore the entire solar system with smooth camera controls
- **All 8 Planets**: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune
- **The Sun**: Detailed sun with glow effects and lighting
- **Planetary Rings**: Saturn and Uranus have realistic ring systems
- **Earth's Moon**: Orbiting moon around Earth
- **Orbital Paths**: Visible orbital trajectories for all planets
- **Planet Labels**: Floating labels for easy identification
- **Detailed Information**: Comprehensive data for each celestial body including:
  - Diameter and distance from the Sun
  - Orbital period and day length
  - Number of moons
  - Temperature
  - Composition
  - Fun facts

## 🎮 Controls

### Camera Controls

- **Left Click + Drag**: Rotate view
- **Right Click + Drag**: Pan view
- **Scroll**: Zoom in/out

### UI Controls

- **Orbit Speed**: Adjust how fast planets orbit the Sun
- **Rotation Speed**: Adjust how fast planets rotate on their axis
- **Toggle Orbits**: Show/hide orbital paths
- **Toggle Labels**: Show/hide planet names
- **Reset View**: Return camera to default position

### Interaction

- **Click on any planet**: View detailed information
- **Navigation bar**: Quick access to any planet

## 🚀 Getting Started

### Option 1: Open Directly

Simply open `index.html` in any modern web browser.

### Option 2: Local Server

For the best experience, run a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 📁 Project Structure

```
solar-system-3d/
├── index.html      # Main HTML file
├── styles.css      # Modern CSS styling
├── main.js         # Three.js visualization logic
├── planetData.js   # Planet information database
└── README.md       # This file
```

## 🪐 Planet Information

Each planet includes:

- **Type**: Terrestrial, Gas Giant, or Ice Giant
- **Physical Properties**: Diameter, mass, composition
- **Orbital Data**: Distance from Sun, orbital period
- **Unique Features**: Moons, rings, special characteristics
- **Fun Facts**: Interesting tidbits about each world

## 🛠️ Technologies Used

- **Three.js**: 3D graphics library
- **OrbitControls**: Camera manipulation
- **CSS3**: Modern styling with gradients and animations
- **Google Fonts**: Orbitron and Exo 2 fonts

## 🎨 Visual Features

- **Starfield Background**: 15,000+ stars with color variations
- **Sun Glow Effect**: Multi-layered glow around the Sun
- **Planetary Atmospheres**: Earth has a visible atmosphere
- **Smooth Animations**: 60 FPS rendering with requestAnimationFrame
- **Responsive Design**: Works on desktop and tablet devices

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## 🔧 Customization

You can easily customize the visualization by modifying `planetData.js`:

- Change planet sizes
- Adjust orbital speeds
- Modify colors
- Add more information

## 📄 License

This project is open source and available for educational purposes.

---

Made with ❤️ and Three.js
