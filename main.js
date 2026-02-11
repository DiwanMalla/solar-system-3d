// Solar System 3D Visualization - Main Script

// Global variables
let scene, camera, renderer, controls;
let planets = {};
let orbits = [];
let labels = [];
let selectedPlanet = null;
let orbitSpeedMultiplier = 1;
let rotationSpeedMultiplier = 1;
let showOrbits = true;
let showLabels = true;
let clock = new THREE.Clock();
let textureLoader;

// Initialize the scene
function init() {
  console.log("init() called");

  try {
    console.log("Initializing solar system...");

    // Check if THREE is available
    if (typeof THREE === "undefined") {
      throw new Error("THREE.js library not loaded");
    }

    // Check if planetData is available
    if (typeof planetData === "undefined") {
      throw new Error("planetData not loaded");
    }

    console.log("THREE.js and planetData loaded successfully");
    scene = new THREE.Scene();
    textureLoader = new THREE.TextureLoader();

    // Create camera
    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      4000, // Increased far plane for skybox
    );
    camera.position.set(100, 80, 150);

    // Create renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvasContainer = document.getElementById("canvas-container");
    if (!canvasContainer) {
      throw new Error("Canvas container not found");
    }
    canvasContainer.appendChild(renderer.domElement);

    // Create controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 1000;
    controls.enablePan = true;
    controls.autoRotate = false;

    // Add starfield background
    createStarfield();

    // Add ambient light - brighter for textures
    const ambientLight = new THREE.AmbientLight(0x333333, 0.8);
    scene.add(ambientLight);

    // Create the Sun with point light
    createSun();

    // Create all planets
    createPlanets();

    // Create Asteroid Belt
    createAsteroidBelt();

    // Create orbital paths
    createOrbits();

    // Setup raycaster for planet selection
    setupRaycaster();

    // Setup event listeners
    setupEventListeners();

    // Hide loading screen
    setTimeout(() => {
      const loadingScreen = document.getElementById("loadingScreen");
      if (loadingScreen) {
        loadingScreen.classList.add("hidden");
      }
    }, 1500);

    // Start animation loop
    animate();
  } catch (error) {
    console.error("Error initializing solar system:", error);
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      loadingScreen.innerHTML = `
      <div class="loader">
        <p style="color: #ff6b6b;">Error loading Solar System</p>
        <p style="color: #a0aec0; font-size: 0.9rem; margin-top: 10px;">${error.message}</p>
      </div>
    `;
    }
  }
}

// Create starfield background (kept as is for procedural stars)
function createStarfield() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });

  const starsVertices = [];
  for (let i = 0; i < 15000; i++) {
    const x = (Math.random() - 0.5) * 3000;
    const y = (Math.random() - 0.5) * 3000;
    const z = (Math.random() - 0.5) * 3000;
    starsVertices.push(x, y, z);
  }

  starsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starsVertices, 3),
  );
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);
}

// Create the Sun
function createSun() {
  const sunData = planetData.sun;

  // Sun geometry
  const sunGeometry = new THREE.SphereGeometry(sunData.size, 64, 64);

  // Sun material
  let sunMaterial;
  
  if (sunData.texture) {
    const texture = textureLoader.load(sunData.texture);
    sunMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      color: 0xffffff, // White to show texture colors correctly
    });
  } else {
    sunMaterial = new THREE.MeshBasicMaterial({
      color: sunData.color,
      transparent: true,
      opacity: 1,
    });
  }

  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.name = "sun";
  sun.userData = { planetKey: "sun" };
  scene.add(sun);
  planets.sun = { mesh: sun, data: sunData };

  // Sun glow
  const glowGeometry = new THREE.SphereGeometry(sunData.size * 1.2, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide,
  });
  const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  sun.add(sunGlow);

  // Point light from sun
  const sunLight = new THREE.PointLight(0xffffff, 1.5, 1000);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sun.add(sunLight);

  // Create label for sun
  createLabel("sun", sun);
}

// Create all planets
function createPlanets() {
  const planetKeys = [
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
  ];

  planetKeys.forEach((key) => {
    createPlanet(key);
  });
}

// Create individual planet
function createPlanet(key) {
  const data = planetData[key];

  // Planet group for orbit
  const planetGroup = new THREE.Group();
  scene.add(planetGroup);

  // Planet geometry
  const geometry = new THREE.SphereGeometry(data.size, 64, 64); // Higher detail for textures

  // Planet material
  let material;
  
  if (data.texture) {
    const texture = textureLoader.load(data.texture);
    material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.1,
    });
  } else {
    // Fallback to colors
      if (key === "earth") {
        material = new THREE.MeshPhongMaterial({
          color: data.color,
          shininess: 25,
          specular: 0x333333,
        });
      } else {
        material = new THREE.MeshPhongMaterial({
          color: data.color,
          shininess: 15,
          specular: 0x222222,
        });
      }
  }

  const planet = new THREE.Mesh(geometry, material);
  planet.name = key;
  planet.userData = { planetKey: key };
  planet.castShadow = true;
  planet.receiveShadow = true;

  // Position planet at orbit radius
  planet.position.x = data.orbitRadius;

  // Apply axial tilt
  if (data.tilt) {
    planet.rotation.z = data.tilt;
  }
  
  // Store planet reference BEFORE adding children that expect it
  planets[key] = {
    mesh: planet,
    group: planetGroup,
    data: data,
    angle: Math.random() * Math.PI * 2, // Random starting position
  };

  planetGroup.add(planet);

  // Add rings for Saturn and Uranus
  if (data.hasRings) {
    createRings(planet, key, data);
  }

  // Add atmosphere/clouds for Earth
  if (key === "earth" && data.cloudTexture) {
    const cloudGeo = new THREE.SphereGeometry(data.size * 1.01, 64, 64);
    const cloudTex = textureLoader.load(data.cloudTexture);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    planet.add(clouds);
    planets[key].clouds = clouds; // Store reference for animation
  } else if (key === "earth") {
      createAtmosphere(planet, data);
  }

  // Add moon for Earth
  if (key === "earth") {
    createMoon(planet);
  }

  // Add Galilean moons for Jupiter
  if (key === "jupiter") {
    createGalileanMoons(planet);
  }

  // Create label
  createLabel(key, planet);
}

// Create planetary rings
function createRings(planet, key, data) {
  let innerRadius, outerRadius, ringColor;

  if (key === "saturn") {
    innerRadius = data.size * 1.4;
    outerRadius = data.size * 2.5;
    ringColor = 0xc9a227;
  } else if (key === "uranus") {
    innerRadius = data.size * 1.5;
    outerRadius = data.size * 2;
    ringColor = 0x4fd0e7;
  }

  const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
  let ringMaterial;
  
  if (data.ringTexture) {
    const texture = textureLoader.load(data.ringTexture);
    // Align texture properly on ring
    texture.rotation = Math.PI / 2;
    ringMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    
    // Adjust UVs for ring mapping if needed, but standard might work.
    // For a simple ring texture (linear strip), we need cylindrical mapping or similar.
    // However, the downloaded texture is likely a full circle image or a strip.
    // If it's a strip (common for Saturn), we need to check UVs.
    // Assuming standard ring texture mapping for now.
    
    // If the texture is a square image of the full ring system (top down):
    // Standard RingGeometry UVs are polar.
  } else {
    ringMaterial = new THREE.MeshBasicMaterial({
      color: ringColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
  }

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;

  if (key === "uranus") {
    ring.rotation.y = Math.PI / 2;
  }

  planet.add(ring);
}

// Create atmosphere (fallback for Earth if no texture)
function createAtmosphere(planet, data) {
  const atmosphereGeometry = new THREE.SphereGeometry(data.size * 1.05, 32, 32);
  const atmosphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x87ceeb,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide,
  });

  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  planet.add(atmosphere);
}

// Create Earth's moon
function createMoon(earthMesh) {
  const moonGeometry = new THREE.SphereGeometry(0.27 * planetData.earth.size, 32, 32);
  let moonMaterial;
  
  if (planetData.earth.texture) { // Assuming if earth has texture, we have moon texture (simplification)
      // Or better check for specific moon texture path if we added it.
      // We didn't add it to planetData, but we downloaded "textures/moon.jpg".
      const texture = textureLoader.load("textures/moon.jpg");
      moonMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.9,
        metalness: 0,
      });
  } else {
      moonMaterial = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        shininess: 5,
      });
  }

  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.position.x = 3;

  // Moon orbit group
  const moonOrbit = new THREE.Group();
  moonOrbit.add(moon);
  earthMesh.add(moonOrbit);

  planets.earth.moon = moon;
  planets.earth.moonOrbit = moonOrbit;
}

// Create Asteroid Belt
function createAsteroidBelt() {
  const asteroidcount = 5000;
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  
  for (let i = 0; i < asteroidcount; i++) {
    // Random radius between Mars (70) and Jupiter (100)
    const r = 80 + Math.random() * 15;
    const theta = Math.random() * Math.PI * 2;
    // Small vertical spread
    const y = (Math.random() - 0.5) * 4;

    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);

    positions.push(x, y, z);

    // Variation in gray color
    const gray = 0.5 + Math.random() * 0.4;
    colors.push(gray, gray, gray);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  const asteroids = new THREE.Points(geometry, material);
  asteroids.name = "asteroidBelt";
  scene.add(asteroids);
  
  // Store reference if needed, though simple rotation in animate is fine. 
  // But let's add it to planets so it can be accessed if we want to rotate it specifically.
  // We'll define a custom animate property for it or just rotate the mesh group.
  planets['asteroids'] = { 
      mesh: asteroids, 
      data: { rotationSpeed: 0.001, orbitSpeed: 0, orbitRadius: 0 } // Dummy data to prevent crash in animate loop
  };
}

// Create orbital paths
function createOrbits() {
  const planetKeys = [
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
  ];

  planetKeys.forEach((key) => {
    const data = planetData[key];
    const orbitGeometry = new THREE.BufferGeometry();
    const points = [];

    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      points.push(
        Math.cos(angle) * data.orbitRadius,
        0,
        Math.sin(angle) * data.orbitRadius,
      );
    }

    orbitGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3),
    );

    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x444466,
      transparent: true,
      opacity: 0.4,
    });

    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbit);
    orbits.push(orbit);
  });
}

// Create planet label
function createLabel(key, mesh) {
  const label = document.createElement("div");
  label.className = "planet-label";
  label.textContent = planetData[key].name;
  label.style.display = "block";
  document.body.appendChild(label);

  labels.push({
    element: label,
    mesh: mesh,
    key: key,
  });
}

// Update labels position
function updateLabels() {
  labels.forEach((label) => {
    if (!showLabels) {
      label.element.style.display = "none";
      return;
    }

    const position = new THREE.Vector3();
    label.mesh.getWorldPosition(position);
    position.y += planetData[label.key].size + 2;

    const projected = position.clone().project(camera);

    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

    if (projected.z < 1) {
      label.element.style.display = "block";
      label.element.style.left = x + "px";
      label.element.style.top = y + "px";
    } else {
      label.element.style.display = "none";
    }
  });
}

// Setup raycaster for planet selection
function setupRaycaster() {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  renderer.domElement.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const planetMeshes = Object.values(planets).map((p) => p.mesh);
    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
      const planetKey = intersects[0].object.userData.planetKey;
      selectPlanet(planetKey);
    }
  });

  // Hover effect
  renderer.domElement.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const planetMeshes = Object.values(planets).map((p) => p.mesh);
    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
  });
}

// Select planet and show info
function selectPlanet(planetKey) {
  selectedPlanet = planetKey;
  const data = planetData[planetKey];

  // Update info panel
  document.getElementById("planetName").textContent = data.name;
  document.getElementById("planetType").textContent = data.type;
  document.getElementById("planetDiameter").textContent = data.diameter;
  document.getElementById("planetDistance").textContent = data.distance;
  document.getElementById("planetOrbitalPeriod").textContent =
    data.orbitalPeriod;
  document.getElementById("planetDayLength").textContent = data.dayLength;
  document.getElementById("planetMoons").textContent = data.moons;
  document.getElementById("planetTemperature").textContent = data.temperature;
  document.getElementById("planetComposition").textContent = data.composition;
  document.getElementById("planetDescription").textContent = data.description;

  // Update planet icon
  const planetIcon = document.getElementById("planetIcon");
  planetIcon.style.background = data.gradient;

  // Update fun facts
  const factsList = document.getElementById("planetFacts");
  factsList.innerHTML = "";
  data.facts.forEach((fact) => {
    const li = document.createElement("li");
    li.textContent = fact;
    factsList.appendChild(li);
  });

  // Show panel
  document.getElementById("infoPanel").classList.add("active");

  // Update navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.planet === planetKey) {
      item.classList.add("active");
    }
  });

  // Initial camera position (will be updated in animate loop)
  updateCameraForPlanet(planetKey, true);
}

// Update camera to follow planet and avoid sun occlusion
function updateCameraForPlanet(planetKey, isInitial = false) {
  const planet = planets[planetKey];
  if (!planet) return;

  const targetPosition = new THREE.Vector3();
  planet.mesh.getWorldPosition(targetPosition);

  const data = planetData[planetKey];
  const distance = data.size * 8;

  // Calculate camera position that follows the planet in its orbit
  // Position camera "behind" the planet in its orbital direction
  let cameraOffset = new THREE.Vector3();
  
  if (planetKey === 'sun') {
    // For sun, just orbit around it
    cameraOffset.set(distance, distance * 0.5, distance);
  } else {
    // Get the planet's orbital angle
    const angle = planet.angle || 0;
    
    // Calculate tangent to orbit (perpendicular to radius)
    // This gives us the direction of orbital motion
    const tangentAngle = angle + Math.PI / 2;
    
    // Position camera behind and above the planet in its orbit
    // "Behind" means opposite to its direction of motion
    const behindAngle = angle + Math.PI; // Opposite side of orbit
    
    // Mix between behind and to the side for better view
    const viewAngle = angle + Math.PI * 0.75; // 135 degrees behind
    
    cameraOffset.x = Math.cos(viewAngle) * distance;
    cameraOffset.z = Math.sin(viewAngle) * distance;
    cameraOffset.y = distance * 0.4; // Elevated view
  }

  const cameraTarget = new THREE.Vector3().addVectors(targetPosition, cameraOffset);

  if (isInitial) {
    // Smooth initial transition
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    let progress = 0;

    function animateCamera() {
      progress += 0.02;
      if (progress >= 1) {
        camera.position.copy(cameraTarget);
        controls.target.copy(targetPosition);
        return;
      }

      const eased = easeOutCubic(progress);
      camera.position.lerpVectors(startPosition, cameraTarget, eased);
      controls.target.lerpVectors(startTarget, targetPosition, eased);

      requestAnimationFrame(animateCamera);
    }

    animateCamera();
  } else {
    // Smooth continuous following
    camera.position.lerp(cameraTarget, 0.05);
    controls.target.lerp(targetPosition, 0.1);
  }
}

// Create Galilean Moons for Jupiter
function createGalileanMoons(jupiterMesh) {
  const moons = [
    { name: "Io", size: 0.6, distance: 8, color: 0xffff00, speed: 0.04 },
    { name: "Europa", size: 0.5, distance: 10, color: 0xffffff, speed: 0.03 },
    { name: "Ganymede", size: 0.8, distance: 13, color: 0xcccccc, speed: 0.02 },
    { name: "Callisto", size: 0.7, distance: 16, color: 0x999999, speed: 0.01 }
  ];

  planets.jupiter.moons = [];

  moons.forEach(moonData => {
    const geometry = new THREE.SphereGeometry(moonData.size, 16, 16);
    const material = new THREE.MeshPhongMaterial({ color: moonData.color });
    const moon = new THREE.Mesh(geometry, material);
    
    // Create orbit group for rotation
    const orbitGroup = new THREE.Group();
    moon.position.x = moonData.distance;
    orbitGroup.add(moon);
    
    // Random starting position
    orbitGroup.rotation.y = Math.random() * Math.PI * 2;
    
    jupiterMesh.add(orbitGroup);
    
    planets.jupiter.moons.push({
      mesh: moon,
      group: orbitGroup,
      data: moonData
    });
  });
}

// Tour Mode
let isTouring = false;
let tourIndex = 0;
let tourInterval;

function startTour() {
  if (isTouring) return;
  isTouring = true;
  tourIndex = 0;
  
  const planetKeys = ["sun", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];
  
  function nextPlanet() {
    if (!isTouring) return;
    
    if (tourIndex >= planetKeys.length) {
      isTouring = false;
      document.getElementById("startTour").textContent = "🚀 Start Tour";
      return;
    }
    
    selectPlanet(planetKeys[tourIndex]);
    tourIndex++;
    
    // Move to next planet after 8 seconds
    tourInterval = setTimeout(nextPlanet, 8000);
  }
  
  document.getElementById("startTour").textContent = "⏹ Stop Tour";
  nextPlanet();
}

function stopTour() {
  isTouring = false;
  clearTimeout(tourInterval);
  document.getElementById("startTour").textContent = "🚀 Start Tour";
}

// Real-time Scale Logic
let isRealTime = false;
const orbitalPeriods = {
    mercury: 88,
    venus: 225,
    earth: 365.25,
    mars: 687,
    jupiter: 4333,
    saturn: 10759,
    uranus: 30687,
    neptune: 60190
};

function toggleRealTime(enabled) {
    isRealTime = enabled;
    if (enabled) {
        // Adjust speeds to be relative to Earth years (simplified)
        // This is still sped up, but relative proportions are accurate
        orbitSpeedMultiplier = 0.5; 
        document.getElementById("speedValue").textContent = "Real-ish";
        document.getElementById("orbitSpeed").disabled = true;
    } else {
        orbitSpeedMultiplier = 1;
        document.getElementById("speedValue").textContent = "1x";
        document.getElementById("orbitSpeed").disabled = false;
    }
}


// Easing function
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Setup event listeners
function setupEventListeners() {
  // Orbit speed control
  document.getElementById("orbitSpeed").addEventListener("input", (e) => {
    orbitSpeedMultiplier = parseFloat(e.target.value);
    document.getElementById("speedValue").textContent =
      orbitSpeedMultiplier + "x";
  });

  // Rotation speed control
  document.getElementById("rotationSpeed").addEventListener("input", (e) => {
    rotationSpeedMultiplier = parseFloat(e.target.value);
    document.getElementById("rotationValue").textContent =
      rotationSpeedMultiplier + "x";
  });

  // Toggle orbits
  document.getElementById("toggleOrbits").addEventListener("click", () => {
    showOrbits = !showOrbits;
    orbits.forEach((orbit) => {
      orbit.visible = showOrbits;
    });
  });

  // Toggle labels
  document.getElementById("toggleLabels").addEventListener("click", () => {
    showLabels = !showLabels;
  });

  // Reset camera
  document.getElementById("resetCamera").addEventListener("click", () => {
    if (isTouring) stopTour();
    camera.position.set(100, 80, 150);
    controls.target.set(0, 0, 0);
    document.getElementById("infoPanel").classList.remove("active");
    selectedPlanet = null;
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });
  });

  // Tour Button
  document.getElementById("startTour").addEventListener("click", () => {
      if (isTouring) {
          stopTour();
      } else {
          startTour();
      }
  });

  // Real-time Toggle
  document.getElementById("realTimeToggle").addEventListener("change", (e) => {
      toggleRealTime(e.target.checked);
  });
  
  // Date Picker
  document.getElementById("datePicker").addEventListener("change", (e) => {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
          // Calculate planet positions based on date (Simple approximation)
          // Epoch: J2000 or similar could be used.
          // For this demo, we'll just set random angles seeded by date
          // or leave it as a "set start time" for the simulation
          const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
          console.log("Setting simulation to day: " + dayOfYear);
          
          Object.keys(planets).forEach(key => {
              if (key === 'sun' || key === 'asteroids') return;
              
              // Very rough approximation: Angle = (Days / Period) * 2PI
              // Real calculation requires Kepler's equations and orbital elements.
              const period = orbitalPeriods[key] || 365;
              planets[key].angle = (dayOfYear / period) * Math.PI * 2;
          });
      }
  });

  // Close panel
  document.getElementById("closePanel").addEventListener("click", () => {
    // Stop tour if user manually closes panel
    if (isTouring) stopTour();
    
    document.getElementById("infoPanel").classList.remove("active");
    selectedPlanet = null;
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });
  });

  // Planet navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      if (isTouring) stopTour();
      
      const planetKey = item.dataset.planet;
      selectPlanet(planetKey);
    });
  });

  // Window resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Rotate sun
  if (planets.sun) {
    planets.sun.mesh.rotation.y +=
      planetData.sun.rotationSpeed * rotationSpeedMultiplier;
  }

  // Animate planets
  Object.keys(planets).forEach((key) => {
    if (key === "sun") return;
    
    // Special handling for asteroids
    if (key === 'asteroids') {
        const asteroids = planets[key];
        asteroids.mesh.rotation.y += 0.0005 * orbitSpeedMultiplier;
        return;
    }

    const planet = planets[key];
    const data = planet.data;

    // Orbital motion
    if (isRealTime) {
         // Use realistic relative speeds based on orbital period
         // Speed = (2PI / Period) * Multiplier
         const period = orbitalPeriods[key] || 365;
         // Normalize to Earth seconds? No, just relative
         const speed = (365.25 / period) * 0.01; // Base speed relative to Earth
         planet.angle += speed * orbitSpeedMultiplier * 0.1; // Slower for realism
    } else {
        planet.angle += data.orbitSpeed * orbitSpeedMultiplier * delta * 10;
    }
    
    planet.mesh.position.x = Math.cos(planet.angle) * data.orbitRadius;
    planet.mesh.position.z = Math.sin(planet.angle) * data.orbitRadius;

    // Planet rotation
    planet.mesh.rotation.y += data.rotationSpeed * rotationSpeedMultiplier;
    
    // Cloud rotation for Earth
    if (planet.clouds) {
        planet.clouds.rotation.y += 0.005 * rotationSpeedMultiplier;
    }

    // Moon orbit (for Earth)
    if (planet.moonOrbit) {
      planet.moonOrbit.rotation.y += 0.02 * orbitSpeedMultiplier;
    }
    
    // Galilean Moons (for Jupiter)
    if (key === 'jupiter' && planet.moons) {
        planet.moons.forEach(moonObj => {
            // Simply rotate the group around Jupiter
            moonObj.group.rotation.y += moonObj.data.speed * orbitSpeedMultiplier;
            // Optionally rotate moon itself
            moonObj.mesh.rotation.y += 0.01;
        });
    }
  });

  // Update camera to follow selected planet
  if (selectedPlanet && selectedPlanet !== 'sun') {
    updateCameraForPlanet(selectedPlanet, false);
  }

  // Update labels
  updateLabels();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing solar system...");

  // Add a fallback timeout to hide loading screen
  const fallbackTimeout = setTimeout(() => {
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen && !loadingScreen.classList.contains("hidden")) {
      console.warn("Fallback: hiding loading screen");
      loadingScreen.classList.add("hidden");
    }
  }, 5000);

  try {
    init();
    clearTimeout(fallbackTimeout);
  } catch (error) {
    console.error("Failed to initialize:", error);
    clearTimeout(fallbackTimeout);
  }
});
