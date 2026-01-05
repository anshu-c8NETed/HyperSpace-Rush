import * as THREE from "three";
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";
import spline from "./spline.js";

// ===== OPTIMIZED CONFIG =====
const CONFIG = {
  tubeRadius: 0.65,
  tubeSegments: 300,
  playerRadius: 0.18,
  maxOffset: 0.55,
  baseSpeed: 2.0,
  baseMoveSpeed: 1.25,
  speedIncrement: 0.15,
  moveSpeedIncrement: 0.02,
  scorePerSecond: 10,
  levelScoreThreshold: 150,
  obstacleBaseCount: 5,
  obstacleIncrementPerLevel: 2,
  obstacleMaxCount: 50,
  obstacleSize: 0.08,
  collectibleSize: 0.1,
  collectibleCount: 8,
  collectibleScoreValue: 50,
  boostPower: 2.0,
  boostDuration: 1500,
  boostRechargeRate: 15,
  healthMax: 3,
};

// Enhanced particle config
const CONFIG_PARTICLES = {
  desktop: 1200,
  mobile: 600,
};

// ===== AUDIO FEEDBACK =====
const AudioFeedback = {
  collect: () => {
    navigator.vibrate && navigator.vibrate(50);
  },
  damage: () => {
    navigator.vibrate && navigator.vibrate([100, 50, 100]);
  },
  boost: () => {
    navigator.vibrate && navigator.vibrate(30);
  },
  levelUp: () => {
    navigator.vibrate && navigator.vibrate([50, 30, 50, 30, 100]);
  },
};

// ===== GAME STATE =====
const gameState = {
  isPlaying: false,
  score: 0,
  highScore: parseInt(localStorage.getItem("hyperspace_highscore")) || 0,
  bestLevel: parseInt(localStorage.getItem("hyperspace_bestlevel")) || 1,
  level: 1,
  speedMultiplier: CONFIG.baseSpeed,
  moveSpeed: CONFIG.baseMoveSpeed,
  elapsedMs: 0,
  loopTime: 10000,
  offsetX: 0,
  offsetY: 0,
  velocityX: 0,
  velocityY: 0,
  currentObstacleCount: CONFIG.obstacleBaseCount,
  boostActive: false,
  boostCharge: 100,
  boostCooldown: false,
  health: CONFIG.healthMax,
  invulnerable: false,
};

// Pause state
let isPaused = false;

// ===== DOM ELEMENTS =====
const el = {
  loadingScreen: document.getElementById("loadingScreen"),
  loadingProgress: document.getElementById("loadingProgress"),
  loadingText: document.getElementById("loadingText"),
  instructionsScreen: document.getElementById("instructionsScreen"),
  startFromInstructions: document.getElementById("startFromInstructions"),
  startScreen: document.getElementById("startScreen"),
  startBtn: document.getElementById("startBtn"),
  instructionsBtn: document.getElementById("instructionsBtn"),
  hud: document.getElementById("hud"),
  scoreValue: document.getElementById("scoreValue"),
  levelValue: document.getElementById("levelValue"),
  boostBar: document.getElementById("boostBar"),
  healthBar1: document.getElementById("healthBar1"),
  healthBar2: document.getElementById("healthBar2"),
  healthBar3: document.getElementById("healthBar3"),
  gameOver: document.getElementById("gameOver"),
  restartBtn: document.getElementById("restartBtn"),
  mainMenuBtn: document.getElementById("mainMenuBtn"),
  finalScore: document.getElementById("finalScore"),
  finalHighScore: document.getElementById("finalHighScore"),
  finalLevel: document.getElementById("finalLevel"),
  highScoreDisplay: document.getElementById("highScoreDisplay"),
  bestLevelDisplay: document.getElementById("bestLevelDisplay"),
  scorePopupContainer: document.getElementById("scorePopupContainer"),
};

// ===== SCENE SETUP =====
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.08);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const isMobileDevice = window.innerWidth <= 768 || "ontouchstart" in window;

const renderer = new THREE.WebGLRenderer({
  antialias: window.innerWidth > 768,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, isMobileDevice ? 1.5 : 2)
);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// ===== POST PROCESSING =====
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  isMobileDevice ? 1.2 : 1.5,
  0.4,
  0.85
);
composer.addPass(bloomPass);

// ===== LIGHTING =====
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

const light1 = new THREE.DirectionalLight(0x00ffff, 1.5);
light1.position.set(5, 5, 5);
scene.add(light1);

const light2 = new THREE.DirectionalLight(0xff00ff, 1.0);
light2.position.set(-5, 5, 5);
scene.add(light2);

const pointLight = new THREE.PointLight(0xffff00, 1.0, 100);
pointLight.position.set(0, 0, 10);
scene.add(pointLight);

// ===== ENHANCED PARTICLE SYSTEM =====
const PARTICLE_COUNT = isMobileDevice
  ? CONFIG_PARTICLES.mobile
  : CONFIG_PARTICLES.desktop;

const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(PARTICLE_COUNT * 3);
const particleVel = new Float32Array(PARTICLE_COUNT);
const particleColors = new Float32Array(PARTICLE_COUNT * 3);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const i3 = i * 3;

  particlePos[i3] = (Math.random() - 0.5) * 60;
  particlePos[i3 + 1] = (Math.random() - 0.5) * 60;
  particlePos[i3 + 2] = (Math.random() - 0.5) * 120;

  particleVel[i] = Math.random() * 2.5 + 0.8;

  const colorChoice = Math.random();
  if (colorChoice < 0.6) {
    particleColors[i3] = 0;
    particleColors[i3 + 1] = 1;
    particleColors[i3 + 2] = 1;
  } else if (colorChoice < 0.9) {
    particleColors[i3] = 1;
    particleColors[i3 + 1] = 0;
    particleColors[i3 + 2] = 1;
  } else {
    particleColors[i3] = 1;
    particleColors[i3 + 1] = 1;
    particleColors[i3 + 2] = Math.random() * 0.5 + 0.5;
  }
}

particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

const particleMat = new THREE.PointsMaterial({
  size: isMobileDevice ? 0.1 : 0.15,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  transparent: true,
  opacity: 0.8,
  sizeAttenuation: true,
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ===== TUNNEL =====
const tubeGeo = new THREE.TubeGeometry(
  spline,
  CONFIG.tubeSegments,
  CONFIG.tubeRadius,
  16,
  true
);

const tunnelMat = new THREE.MeshStandardMaterial({
  color: 0x0a0a0f,
  wireframe: false,
  metalness: 0.7,
  roughness: 0.3,
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.4,
});

const tunnel = new THREE.Mesh(tubeGeo, tunnelMat);
scene.add(tunnel);

const edges = new THREE.EdgesGeometry(tubeGeo, 5);
const edgeMat = new THREE.LineBasicMaterial({
  color: 0x00ffff,
  transparent: true,
  opacity: 0.8,
});
const tubeLines = new THREE.LineSegments(edges, edgeMat);
scene.add(tubeLines);

// ===== OBSTACLES (RED - AVOID) =====
const obstaclePool = [];
const activeObstacles = [];
const obstacleGeo = new THREE.BoxGeometry(
  CONFIG.obstacleSize,
  CONFIG.obstacleSize,
  CONFIG.obstacleSize
);

function createObstaclePool(count) {
  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(obstacleGeo, mat);
    mesh.visible = false;
    scene.add(mesh);

    obstaclePool.push({
      mesh,
      pathPosition: 0,
      active: false,
      rotSpeed: (Math.random() - 0.5) * 3,
    });
  }
}

function spawnObstacles(count) {
  activeObstacles.length = 0;

  obstaclePool.forEach((obs) => {
    obs.active = false;
    obs.mesh.visible = false;
  });

  const actualCount = Math.min(count, obstaclePool.length);

  for (let i = 0; i < actualCount; i++) {
    const obstacle = obstaclePool[i];

    const p = 0.2 + (i / actualCount) * 0.75;
    const pos = spline.getPointAt(p % 1);

    const angle = Math.random() * Math.PI * 2;
    const distance = (Math.random() * 0.35 + 0.15) * CONFIG.tubeRadius;
    pos.x += Math.cos(angle) * distance;
    pos.y += Math.sin(angle) * distance;

    obstacle.mesh.position.copy(pos);
    obstacle.mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    obstacle.pathPosition = p;
    obstacle.active = true;
    obstacle.mesh.visible = true;

    activeObstacles.push(obstacle);
  }
}

createObstaclePool(CONFIG.obstacleMaxCount);

// ===== COLLECTIBLES (GREEN - COLLECT) =====
const collectiblePool = [];
const activeCollectibles = [];
const collectibleGeo = new THREE.SphereGeometry(CONFIG.collectibleSize, 16, 16);

function createCollectiblePool(count) {
  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(collectibleGeo, mat);
    mesh.visible = false;
    scene.add(mesh);

    collectiblePool.push({
      mesh,
      pathPosition: 0,
      active: false,
      rotSpeed: 2,
    });
  }
}

function spawnCollectibles() {
  activeCollectibles.length = 0;

  collectiblePool.forEach((col) => {
    col.active = false;
    col.mesh.visible = false;
  });

  for (let i = 0; i < CONFIG.collectibleCount; i++) {
    const collectible = collectiblePool[i];

    const p = 0.15 + (i / CONFIG.collectibleCount) * 0.8;
    const pos = spline.getPointAt(p % 1);

    const angle = Math.random() * Math.PI * 2;
    const distance = (Math.random() * 0.3 + 0.1) * CONFIG.tubeRadius;
    pos.x += Math.cos(angle) * distance;
    pos.y += Math.sin(angle) * distance;

    collectible.mesh.position.copy(pos);
    collectible.pathPosition = p;
    collectible.active = true;
    collectible.mesh.visible = true;

    activeCollectibles.push(collectible);
  }
}

createCollectiblePool(20);

// ===== SCORE POPUP =====
function showScorePopup(x, y, score, isPositive = true) {
  const popup = document.createElement("div");
  popup.className = `score-popup ${isPositive ? "positive" : "negative"}`;
  popup.textContent = isPositive ? `+${score}` : "-1 HP";
  popup.style.left = x + "px";
  popup.style.top = y + "px";

  el.scorePopupContainer.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 1000);
}

// ===== INPUT =====
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  arrowup: false,
  arrowleft: false,
  arrowdown: false,
  arrowright: false,
  space: false,
};

let lastBoostTime = 0;
const boostCooldownInput = 100;

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  // Pause handling
  if (e.key === "Escape" && gameState.isPlaying) {
    togglePause();
    e.preventDefault();
    return;
  }

  if (key in keys || key.startsWith("arrow")) {
    keys[key] = true;
    e.preventDefault();
  }

  if (e.code === "Space" || key === " ") {
    const now = Date.now();
    if (now - lastBoostTime > boostCooldownInput) {
      keys.space = true;
      lastBoostTime = now;
    }
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (key in keys || key.startsWith("arrow")) {
    keys[key] = false;
  }
  if (e.code === "Space" || key === " ") {
    keys.space = false;
  }
});

// Mobile Controls
let joystickActive = false;
let joystickOrigin = { x: 0, y: 0 };
const joystickArea = document.getElementById("joystickArea");
const joystick = document.getElementById("joystick");

if (joystickArea) {
  const handleStart = (e) => {
    joystickActive = true;
    const rect = joystickArea.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    joystickOrigin.x = touch.clientX;
    joystickOrigin.y = touch.clientY;
    joystick.style.left = touch.clientX - rect.left + "px";
    joystick.style.top = touch.clientY - rect.top + "px";
    joystick.style.opacity = "1";
  };

  const handleMove = (e) => {
    if (!joystickActive) return;
    e.preventDefault();

    const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - joystickOrigin.x;
    const dy = touch.clientY - joystickOrigin.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 50;
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(dy, dx);

    const finalX = joystickOrigin.x + Math.cos(angle) * clampedDistance;
    const finalY = joystickOrigin.y + Math.sin(angle) * clampedDistance;

    const rect = joystickArea.getBoundingClientRect();
    joystick.style.left = finalX - rect.left + "px";
    joystick.style.top = finalY - rect.top + "px";

    const threshold = 15;
    keys.a = dx < -threshold;
    keys.d = dx > threshold;
    keys.w = dy < -threshold;
    keys.s = dy > threshold;
  };

  const handleEnd = () => {
    joystickActive = false;
    joystick.style.opacity = "0";
    keys.a = keys.d = keys.w = keys.s = false;
  };

  if (isMobileDevice) {
    joystickArea.addEventListener("touchstart", handleStart, { passive: true });
    joystickArea.addEventListener("touchmove", handleMove, { passive: false });
    joystickArea.addEventListener("touchend", handleEnd, { passive: true });
    joystickArea.addEventListener("touchcancel", handleEnd, { passive: true });
  }
}

const mobileBoost = document.getElementById("mobileBoost");
if (mobileBoost) {
  const handleBoostStart = (e) => {
    e.preventDefault();
    keys.space = true;
    mobileBoost.style.transform = "scale(0.95)";
  };

  const handleBoostEnd = (e) => {
    e.preventDefault();
    keys.space = false;
    mobileBoost.style.transform = "scale(1)";
  };

  mobileBoost.addEventListener("touchstart", handleBoostStart, {
    passive: false,
  });
  mobileBoost.addEventListener("touchend", handleBoostEnd, { passive: false });
  mobileBoost.addEventListener("touchcancel", handleBoostEnd, {
    passive: false,
  });

  mobileBoost.addEventListener("mousedown", handleBoostStart);
  mobileBoost.addEventListener("mouseup", handleBoostEnd);
  mobileBoost.addEventListener("mouseleave", handleBoostEnd);
}

// ===== PAUSE FUNCTIONALITY =====
function createPauseOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "pauseOverlay";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 18, 0.95);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 9900;
    opacity: 0;
  `;

  overlay.innerHTML = `
    <div style="text-align: center;">
      <h1 style="font-family: var(--font-display); font-size: 3rem; color: var(--cyan); margin-bottom: 20px;">PAUSED</h1>
      <p style="font-size: 1.2rem; color: rgba(255, 255, 255, 0.7);">Press ESC to resume</p>
    </div>
  `;

  document.body.appendChild(overlay);
  return overlay;
}

function togglePause() {
  isPaused = !isPaused;

  const pauseOverlay =
    document.getElementById("pauseOverlay") || createPauseOverlay();

  if (isPaused) {
    pauseOverlay.style.display = "flex";
    gsap.to(pauseOverlay, { opacity: 1, duration: 0.3 });
  } else {
    gsap.to(pauseOverlay, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => (pauseOverlay.style.display = "none"),
    });
  }
}

// ===== GAME MECHANICS =====
function activateBoost() {
  if (
    !gameState.boostActive &&
    !gameState.boostCooldown &&
    gameState.boostCharge >= 30
  ) {
    gameState.boostActive = true;

    AudioFeedback.boost();

    gsap.to(bloomPass, {
      strength: 3.0,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
    });

    const boostContainer = document.querySelector(".boost-container");
    if (boostContainer) {
      boostContainer.style.transform = "scale(1.1)";
      boostContainer.style.borderColor = "var(--orange)";
    }

    setTimeout(() => {
      gameState.boostActive = false;
      gameState.boostCooldown = true;

      if (boostContainer) {
        boostContainer.style.transform = "scale(1)";
        boostContainer.style.borderColor = "rgba(255, 255, 0, 0.4)";
      }

      setTimeout(() => {
        gameState.boostCooldown = false;
      }, 800);
    }, CONFIG.boostDuration);
  }
}

function takeDamage() {
  if (gameState.health <= 0 || gameState.invulnerable) return;

  gameState.health--;
  gameState.invulnerable = true;

  AudioFeedback.damage();

  updateHealthDisplay();

  gsap.to(camera.position, {
    x: camera.position.x + (Math.random() - 0.5) * 0.3,
    y: camera.position.y + (Math.random() - 0.5) * 0.3,
    duration: 0.05,
    yoyo: true,
    repeat: 5,
    ease: "power2.inOut",
  });

  const flashDiv = document.createElement("div");
  flashDiv.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(255, 0, 0, 0.3);
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(flashDiv);

  gsap.to(flashDiv, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => flashDiv.remove(),
  });

  gsap.to(renderer, {
    toneMappingExposure: 2.5,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
  });

  showScorePopup(window.innerWidth / 2, window.innerHeight / 2, 0, false);

  setTimeout(() => {
    gameState.invulnerable = false;
  }, 1200);

  if (gameState.health <= 0) {
    endGame();
  }
}

function collectItem() {
  gameState.score += CONFIG.collectibleScoreValue;

  AudioFeedback.collect();

  gsap.to(bloomPass, {
    strength: 2.5,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
  });

  gsap.to(el.scoreValue, {
    scale: 1.3,
    duration: 0.15,
    yoyo: true,
    repeat: 1,
  });

  showScorePopup(
    window.innerWidth / 2,
    window.innerHeight / 2,
    CONFIG.collectibleScoreValue,
    true
  );
}

function updateHealthDisplay() {
  [el.healthBar1, el.healthBar2, el.healthBar3].forEach((bar, i) => {
    if (i < gameState.health) {
      bar.classList.add("active");
    } else {
      bar.classList.remove("active");
    }
  });
}

// ===== CAMERA & MOVEMENT =====
function updateCamera(delta) {
  if (!gameState.isPlaying) return;

  const time = gameState.elapsedMs * 0.1;
  const p = (time % gameState.loopTime) / gameState.loopTime;

  const pos = spline.getPointAt(p);
  const lookAt = spline.getPointAt((p + 0.03) % 1);

  camera.position.copy(pos);
  camera.lookAt(lookAt);

  const forward = new THREE.Vector3().subVectors(lookAt, pos).normalize();
  const right = new THREE.Vector3()
    .crossVectors(forward, camera.up)
    .normalize();
  const up = new THREE.Vector3().copy(camera.up).normalize();

  const moveUp = keys.w || keys.arrowup;
  const moveDown = keys.s || keys.arrowdown;
  const moveLeft = keys.a || keys.arrowleft;
  const moveRight = keys.d || keys.arrowright;

  const acceleration = gameState.moveSpeed * delta * 2.5;
  const damping = 0.9;

  if (moveLeft) gameState.velocityX -= acceleration;
  if (moveRight) gameState.velocityX += acceleration;
  if (moveUp) gameState.velocityY += acceleration;
  if (moveDown) gameState.velocityY -= acceleration;

  gameState.velocityX *= damping;
  gameState.velocityY *= damping;

  gameState.offsetX += gameState.velocityX * delta;
  gameState.offsetY += gameState.velocityY * delta;

  const offsetMagnitude = Math.sqrt(
    gameState.offsetX ** 2 + gameState.offsetY ** 2
  );

  if (offsetMagnitude > CONFIG.maxOffset) {
    const factor = CONFIG.maxOffset / offsetMagnitude;
    gameState.offsetX *= factor;
    gameState.offsetY *= factor;
  }

  const offsetVec = new THREE.Vector3()
    .addScaledVector(right, gameState.offsetX)
    .addScaledVector(up, gameState.offsetY);

  camera.position.add(offsetVec);
  pointLight.position.copy(camera.position);

  if (keys.space && gameState.isPlaying) {
    activateBoost();
  }
}

// ===== OPTIMIZED COLLISION =====
function checkCollisions() {
  if (!gameState.isPlaying) return;

  const playerPos = camera.position;
  const viewDistance = 15;

  const obstacleCollisionRadiusSq =
    (CONFIG.playerRadius + CONFIG.obstacleSize) ** 2;

  for (let obstacle of activeObstacles) {
    if (!obstacle.active) continue;

    const dz = playerPos.z - obstacle.mesh.position.z;
    if (Math.abs(dz) > viewDistance) continue;

    const dx = playerPos.x - obstacle.mesh.position.x;
    const dy = playerPos.y - obstacle.mesh.position.y;
    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq < obstacleCollisionRadiusSq) {
      takeDamage();
      obstacle.active = false;
      obstacle.mesh.visible = false;
      return;
    }
  }

  const collectibleCollisionRadiusSq =
    (CONFIG.playerRadius + CONFIG.collectibleSize) ** 2;

  for (let collectible of activeCollectibles) {
    if (!collectible.active) continue;

    const dz = playerPos.z - collectible.mesh.position.z;
    if (Math.abs(dz) > viewDistance) continue;

    const dx = playerPos.x - collectible.mesh.position.x;
    const dy = playerPos.y - collectible.mesh.position.y;
    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq < collectibleCollisionRadiusSq) {
      collectItem();
      collectible.active = false;
      collectible.mesh.visible = false;
    }
  }
}

// ===== GAME LOOP =====
const clock = new THREE.Clock();
let lastFrameTime = 0;
const targetFPS = 60;
const frameTime = 1000 / targetFPS;

function animate(currentTime = 0) {
  requestAnimationFrame(animate);

  if (isPaused) {
    return;
  }

  const deltaTime = currentTime - lastFrameTime;

  if (deltaTime < frameTime) {
    return;
  }

  lastFrameTime = currentTime - (deltaTime % frameTime);
  const delta = Math.min(clock.getDelta(), 0.1);

  if (gameState.isPlaying) {
    const effectiveSpeed = gameState.boostActive
      ? gameState.speedMultiplier * CONFIG.boostPower
      : gameState.speedMultiplier;

    gameState.elapsedMs += delta * 1000 * effectiveSpeed;
    gameState.score += delta * CONFIG.scorePerSecond * effectiveSpeed;

    const newLevel =
      Math.floor(gameState.score / CONFIG.levelScoreThreshold) + 1;
    if (newLevel > gameState.level) {
      gameState.level = newLevel;
      levelUp();
    }

    if (!gameState.boostActive && gameState.boostCharge < 100) {
      gameState.boostCharge += CONFIG.boostRechargeRate * delta;
      if (gameState.boostCharge > 100) gameState.boostCharge = 100;
    }

    if (gameState.boostActive) {
      gameState.boostCharge -= 40 * delta;
      if (gameState.boostCharge < 0) gameState.boostCharge = 0;
    }

    updateCamera(delta);
    checkCollisions();
    updateHUD();
  }

  for (let obstacle of activeObstacles) {
    if (!obstacle.active) continue;
    obstacle.mesh.rotation.y += delta * obstacle.rotSpeed;
    obstacle.mesh.rotation.x += delta * obstacle.rotSpeed * 0.5;
  }
  for (let collectible of activeCollectibles) {
    if (!collectible.active) continue;
    collectible.mesh.rotation.y += delta * collectible.rotSpeed;

    const scale = 1 + Math.sin(Date.now() * 0.005) * 0.2;
    collectible.mesh.scale.set(scale, scale, scale);
  }

  // Animate particles
  const positions = particles.geometry.attributes.position.array;
  const colors = particles.geometry.attributes.color.array;
  const effectiveSpeed = gameState.isPlaying
    ? gameState.boostActive
      ? gameState.speedMultiplier * CONFIG.boostPower
      : gameState.speedMultiplier
    : 1;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3 + 2] += particleVel[i] * effectiveSpeed * delta * 15;

    if (positions[i3 + 2] > 50) {
      positions[i3 + 2] = -60;
      positions[i3] = (Math.random() - 0.5) * 60;
      positions[i3 + 1] = (Math.random() - 0.5) * 60;
    }

    if (gameState.boostActive) {
      const pulse = Math.sin(Date.now() * 0.01 + i) * 0.3 + 0.7;
      colors[i3] *= pulse;
      colors[i3 + 1] *= pulse;
      colors[i3 + 2] *= pulse;
    }
  }

  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.attributes.color.needsUpdate = true;

  const time = Date.now() * 0.0002;
  tubeLines.material.color.setHSL((time * 0.3) % 1, 1, 0.5);

  composer.render();
}

// ===== UI =====
function updateHUD() {
  el.scoreValue.textContent = Math.floor(gameState.score);
  el.levelValue.textContent = gameState.level;
  el.boostBar.style.width = gameState.boostCharge + "%";
}

function levelUp() {
  gameState.speedMultiplier += CONFIG.speedIncrement;
  gameState.moveSpeed += CONFIG.moveSpeedIncrement;

  gameState.currentObstacleCount = Math.min(
    CONFIG.obstacleBaseCount +
      (gameState.level - 1) * CONFIG.obstacleIncrementPerLevel,
    CONFIG.obstacleMaxCount
  );

  spawnObstacles(gameState.currentObstacleCount);
  spawnCollectibles();

  AudioFeedback.levelUp();

  gsap.to(el.levelValue, {
    scale: 2,
    duration: 0.3,
    yoyo: true,
    repeat: 1,
    ease: "back.out(2)",
  });

  const levelUpDiv = document.createElement("div");
  levelUpDiv.textContent = `LEVEL ${gameState.level}`;
  levelUpDiv.style.cssText = `
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-display);
  font-size: clamp(2rem, 8vw, 4rem);
  font-weight: 900;
  color: var(--cyan);
  text-shadow: 0 0 40px var(--cyan);
  pointer-events: none;
  z-index: 9999;
  letter-spacing: 0.2em;
  padding: 0 20px;
  text-align: center;
  white-space: nowrap;
`;
  document.body.appendChild(levelUpDiv);

  gsap.fromTo(
    levelUpDiv,
    { scale: 0.5, opacity: 0 },
    {
      scale: 1.5,
      opacity: 1,
      duration: 0.3,
      ease: "back.out(2)",
    }
  );

  gsap.to(levelUpDiv, {
    opacity: 0,
    scale: 2,
    duration: 0.5,
    delay: 0.8,
    onComplete: () => levelUpDiv.remove(),
  });

  gsap.to(bloomPass, {
    strength: 3.0,
    duration: 0.2,
    yoyo: true,
    repeat: 2,
  });
}

// ===== TUTORIAL HINTS =====
function showTutorialHints() {
  const hasPlayedBefore = localStorage.getItem("hyperspace_has_played");

  if (!hasPlayedBefore) {
    localStorage.setItem("hyperspace_has_played", "true");

    setTimeout(() => {
      if (gameState.isPlaying && gameState.score < 100) {
        const hint = document.createElement("div");
        hint.textContent = "Collect green gems for bonus points!";
        hint.style.cssText = `
          position: fixed;
          top: 120px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 255, 0, 0.2);
          border: 2px solid var(--green);
          padding: 15px 30px;
          border-radius: 10px;
          font-family: var(--font-body);
          font-size: 1.1rem;
          color: var(--green);
          z-index: 9000;
          pointer-events: none;
        `;
        document.body.appendChild(hint);

        gsap.to(hint, {
          opacity: 0,
          y: -20,
          duration: 0.5,
          delay: 3,
          onComplete: () => hint.remove(),
        });
      }
    }, 3000);
  }
}

function cleanupGameObjects() {
  activeObstacles.forEach((obs) => {
    obs.active = false;
    obs.mesh.visible = false;
  });

  activeCollectibles.forEach((col) => {
    col.active = false;
    col.mesh.visible = false;
  });

  activeObstacles.length = 0;
  activeCollectibles.length = 0;
}

function startGame() {
  gameState.isPlaying = true;
  gameState.score = 0;
  gameState.level = 1;
  gameState.speedMultiplier = CONFIG.baseSpeed;
  gameState.moveSpeed = CONFIG.baseMoveSpeed;
  gameState.offsetX = 0;
  gameState.offsetY = 0;
  gameState.velocityX = 0;
  gameState.velocityY = 0;
  gameState.elapsedMs = 0;
  gameState.currentObstacleCount = CONFIG.obstacleBaseCount;
  gameState.boostActive = false;
  gameState.boostCharge = 100;
  gameState.boostCooldown = false;
  gameState.health = CONFIG.healthMax;
  gameState.invulnerable = false;

  updateHealthDisplay();
  spawnObstacles(gameState.currentObstacleCount);
  spawnCollectibles();
  showTutorialHints();

  el.hud.classList.add("active");

  gsap.to(el.startScreen, {
    opacity: 0,
    duration: 0.4,
    onComplete: () => {
      el.startScreen.style.display = "none";
    },
  });

  gsap.to(el.instructionsScreen, {
    opacity: 0,
    duration: 0.4,
    onComplete: () => {
      el.instructionsScreen.style.display = "none";
    },
  });
}

function endGame() {
  gameState.isPlaying = false;

  const isNewHighScore = gameState.score > gameState.highScore;
  if (isNewHighScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem("hyperspace_highscore", gameState.highScore);
  }

  if (gameState.level > gameState.bestLevel) {
    gameState.bestLevel = gameState.level;
    localStorage.setItem("hyperspace_bestlevel", gameState.bestLevel);
  }

  el.finalScore.textContent = Math.floor(gameState.score);
  el.finalHighScore.textContent = Math.floor(gameState.highScore);
  el.finalLevel.textContent = gameState.level;

  el.hud.classList.remove("active");
  el.gameOver.classList.add("active");

  gsap.to(bloomPass, {
    strength: 3.0,
    duration: 0.3,
    yoyo: true,
    repeat: 1,
  });
}

function returnToMenu() {
  cleanupGameObjects();

  el.gameOver.classList.remove("active");
  el.hud.classList.remove("active");

  gsap.to(el.startScreen, {
    opacity: 1,
    duration: 0.4,
    onStart: () => {
      el.startScreen.style.display = "flex";
    },
  });

  el.highScoreDisplay.textContent = Math.floor(gameState.highScore);
  el.bestLevelDisplay.textContent = gameState.bestLevel;
}

function showInstructions() {
  el.startScreen.style.display = "none";
  el.instructionsScreen.style.display = "flex";
  gsap.to(el.instructionsScreen, { opacity: 1, duration: 0.4 });
}

// ===== EVENT LISTENERS =====
el.startBtn.addEventListener("click", startGame);
el.instructionsBtn.addEventListener("click", showInstructions);
el.startFromInstructions.addEventListener("click", startGame);
el.restartBtn.addEventListener("click", () => {
  el.gameOver.classList.remove("active");
  startGame();
});
el.mainMenuBtn.addEventListener("click", returnToMenu);

// ===== LOADING =====
let loadProgress = 0;
const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 20 + 10;
  if (loadProgress >= 100) {
    loadProgress = 100;
    clearInterval(loadInterval);

    setTimeout(() => {
      gsap.to(el.loadingScreen, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          el.loadingScreen.style.display = "none";
          el.instructionsScreen.style.display = "flex";
          gsap.to(el.instructionsScreen, { opacity: 1, duration: 0.5 });
        },
      });
    }, 300);
  }

  el.loadingProgress.style.width = loadProgress + "%";
}, 150);

el.highScoreDisplay.textContent = Math.floor(gameState.highScore);
el.bestLevelDisplay.textContent = gameState.bestLevel;

// ===== OPTIMIZED RESIZE =====
let resizeTimeout;
let isResizing = false;

window.addEventListener("resize", () => {
  if (!isResizing) {
    isResizing = true;
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);

      isResizing = false;
    }, 150);
  }
});

// Prevent pull-to-refresh on mobile
document.body.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  },
  { passive: false }
);

// Lock orientation on mobile if possible
if (screen.orientation && screen.orientation.lock) {
  screen.orientation.lock("landscape").catch(() => {
    // Orientation lock not supported or failed
  });
}

// Show mobile controls
if (isMobileDevice) {
  document.getElementById("mobileControls").style.display = "flex";
}

animate();
