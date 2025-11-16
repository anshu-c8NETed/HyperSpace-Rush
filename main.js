
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
    particleCount: 800,
    boostPower: 2.0,
    boostDuration: 1500,
    boostRechargeRate: 15,
    healthMax: 3
};

// ===== GAME STATE =====
const gameState = {
    isPlaying: false,
    score: 0,
    highScore: parseInt(localStorage.getItem('hyperspace_highscore')) || 0,
    bestLevel: parseInt(localStorage.getItem('hyperspace_bestlevel')) || 1,
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
    invulnerable: false
};

// ===== DOM ELEMENTS =====
const el = {
    loadingScreen: document.getElementById('loadingScreen'),
    loadingProgress: document.getElementById('loadingProgress'),
    loadingText: document.getElementById('loadingText'),
    startScreen: document.getElementById('startScreen'),
    startBtn: document.getElementById('startBtn'),
    hud: document.getElementById('hud'),
    scoreValue: document.getElementById('scoreValue'),
    levelValue: document.getElementById('levelValue'),
    boostBar: document.getElementById('boostBar'),
    healthBar1: document.getElementById('healthBar1'),
    healthBar2: document.getElementById('healthBar2'),
    healthBar3: document.getElementById('healthBar3'),
    gameOver: document.getElementById('gameOver'),
    restartBtn: document.getElementById('restartBtn'),
    mainMenuBtn: document.getElementById('mainMenuBtn'),
    finalScore: document.getElementById('finalScore'),
    finalHighScore: document.getElementById('finalHighScore'),
    finalLevel: document.getElementById('finalLevel'),
    highScoreDisplay: document.getElementById('highScoreDisplay'),
    bestLevelDisplay: document.getElementById('bestLevelDisplay')
};

// ===== SCENE SETUP =====
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.08);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ 
    antialias: window.innerWidth > 768,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// ===== POST PROCESSING =====
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
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

// ===== PARTICLE SYSTEM =====
const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(CONFIG.particleCount * 3);
const particleVel = new Float32Array(CONFIG.particleCount);

for (let i = 0; i < CONFIG.particleCount; i++) {
    const i3 = i * 3;
    particlePos[i3] = (Math.random() - 0.5) * 50;
    particlePos[i3 + 1] = (Math.random() - 0.5) * 50;
    particlePos[i3 + 2] = (Math.random() - 0.5) * 100;
    particleVel[i] = Math.random() * 2 + 1;
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

const particleMat = new THREE.PointsMaterial({
    size: 0.12,
    color: 0x00ffff,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.7
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ===== TUNNEL =====
const tubeGeo = new THREE.TubeGeometry(spline, CONFIG.tubeSegments, CONFIG.tubeRadius, 16, true);

const tunnelMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0f,
    wireframe: false,
    metalness: 0.7,
    roughness: 0.3,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.4
});

const tunnel = new THREE.Mesh(tubeGeo, tunnelMat);
scene.add(tunnel);

const edges = new THREE.EdgesGeometry(tubeGeo, 5);
const edgeMat = new THREE.LineBasicMaterial({ 
    color: 0x00ffff,
    transparent: true,
    opacity: 0.8
});
const tubeLines = new THREE.LineSegments(edges, edgeMat);
scene.add(tubeLines);

// ===== OBSTACLES =====
const obstaclePool = [];
const activeObstacles = [];
const obstacleGeo = new THREE.BoxGeometry(CONFIG.obstacleSize, CONFIG.obstacleSize, CONFIG.obstacleSize);
const colors = [0x00ffff, 0xff00ff, 0xffff00, 0xff0080];

function createObstaclePool(count) {
    for (let i = 0; i < count; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const mat = new THREE.MeshBasicMaterial({ 
            color,
            transparent: true,
            opacity: 0.9
        });
        const mesh = new THREE.Mesh(obstacleGeo, mat);
        mesh.visible = false;
        scene.add(mesh);
        
        obstaclePool.push({
            mesh,
            pathPosition: 0,
            active: false,
            rotSpeed: (Math.random() - 0.5) * 3
        });
    }
}

function spawnObstacles(count) {
    activeObstacles.length = 0;
    
    obstaclePool.forEach(obs => {
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

// ===== INPUT =====
const keys = {
    w: false, a: false, s: false, d: false,
    arrowup: false, arrowleft: false, arrowdown: false, arrowright: false,
    space: false
};

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys || key.startsWith('arrow')) {
        keys[key] = true;
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys || key.startsWith('arrow')) {
        keys[key] = false;
    }
});

// Mobile Controls
let joystickActive = false;
let joystickOrigin = { x: 0, y: 0 };
const joystickArea = document.getElementById('joystickArea');
const joystick = document.getElementById('joystick');

if (joystickArea) {
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    
    const handleStart = (e) => {
        joystickActive = true;
        const rect = joystickArea.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        joystickOrigin.x = touch.clientX;
        joystickOrigin.y = touch.clientY;
        joystick.style.left = (touch.clientX - rect.left) + 'px';
        joystick.style.top = (touch.clientY - rect.top) + 'px';
        joystick.style.opacity = '1';
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
        joystick.style.left = (finalX - rect.left) + 'px';
        joystick.style.top = (finalY - rect.top) + 'px';
        
        const threshold = 15;
        keys.a = dx < -threshold;
        keys.d = dx > threshold;
        keys.w = dy < -threshold;
        keys.s = dy > threshold;
    };
    
    const handleEnd = () => {
        joystickActive = false;
        joystick.style.opacity = '0';
        keys.a = keys.d = keys.w = keys.s = false;
    };
    
    if (isMobile) {
        joystickArea.addEventListener('touchstart', handleStart, { passive: true });
        joystickArea.addEventListener('touchmove', handleMove, { passive: false });
        joystickArea.addEventListener('touchend', handleEnd, { passive: true });
        joystickArea.addEventListener('touchcancel', handleEnd, { passive: true });
    }
}

const mobileBoost = document.getElementById('mobileBoost');
if (mobileBoost) {
    const handleBoostStart = (e) => {
        e.preventDefault();
        keys.space = true;
        mobileBoost.style.transform = 'scale(0.95)';
    };
    
    const handleBoostEnd = (e) => {
        e.preventDefault();
        keys.space = false;
        mobileBoost.style.transform = 'scale(1)';
    };
    
    mobileBoost.addEventListener('touchstart', handleBoostStart, { passive: false });
    mobileBoost.addEventListener('touchend', handleBoostEnd, { passive: false });
    mobileBoost.addEventListener('touchcancel', handleBoostEnd, { passive: false });
    
    // Also support mouse for desktop testing
    mobileBoost.addEventListener('mousedown', handleBoostStart);
    mobileBoost.addEventListener('mouseup', handleBoostEnd);
    mobileBoost.addEventListener('mouseleave', handleBoostEnd);
}

// ===== GAME MECHANICS =====
function activateBoost() {
    if (!gameState.boostActive && !gameState.boostCooldown && gameState.boostCharge >= 30) {
        gameState.boostActive = true;
        
        gsap.to(bloomPass, {
            strength: 2.5,
            duration: 0.2,
            yoyo: true,
            repeat: 1
        });
        
        setTimeout(() => {
            gameState.boostActive = false;
            gameState.boostCooldown = true;
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
    
    updateHealthDisplay();
    
    // Screen shake
    gsap.to(camera.position, {
        x: camera.position.x + (Math.random() - 0.5) * 0.2,
        y: camera.position.y + (Math.random() - 0.5) * 0.2,
        duration: 0.05,
        yoyo: true,
        repeat: 3
    });
    
    // Flash
    gsap.to(renderer, {
        toneMappingExposure: 2.5,
        duration: 0.1,
        yoyo: true,
        repeat: 1
    });
    
    setTimeout(() => {
        gameState.invulnerable = false;
    }, 1000);
    
    if (gameState.health <= 0) {
        endGame();
    }
}

function updateHealthDisplay() {
    [el.healthBar1, el.healthBar2, el.healthBar3].forEach((bar, i) => {
        if (i < gameState.health) {
            bar.classList.add('active');
        } else {
            bar.classList.remove('active');
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
    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
    const up = new THREE.Vector3().copy(camera.up).normalize();
    
    // Input
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
    
    // Clamp
    const offsetMagnitude = Math.sqrt(gameState.offsetX ** 2 + gameState.offsetY ** 2);
    
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
    
    // Boost
    if (keys.space) {
        activateBoost();
    }
}

// ===== COLLISION =====
function checkCollisions() {
    if (!gameState.isPlaying) return;
    
    const playerPos = camera.position;
    const collisionRadius = CONFIG.playerRadius + CONFIG.obstacleSize;
    const collisionRadiusSq = collisionRadius * collisionRadius;
    
    for (let obstacle of activeObstacles) {
        if (!obstacle.active) continue;
        
        const dx = playerPos.x - obstacle.mesh.position.x;
        const dy = playerPos.y - obstacle.mesh.position.y;
        const dz = playerPos.z - obstacle.mesh.position.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        
        if (distSq < collisionRadiusSq) {
            takeDamage();
            obstacle.active = false;
            obstacle.mesh.visible = false;
            return;
        }
    }
}

// ===== GAME LOOP =====
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    if (gameState.isPlaying) {
        const effectiveSpeed = gameState.boostActive ? 
            gameState.speedMultiplier * CONFIG.boostPower : 
            gameState.speedMultiplier;
        
        gameState.elapsedMs += delta * 1000 * effectiveSpeed;
        gameState.score += delta * CONFIG.scorePerSecond * effectiveSpeed;
        
        // Level up
        const newLevel = Math.floor(gameState.score / CONFIG.levelScoreThreshold) + 1;
        if (newLevel > gameState.level) {
            gameState.level = newLevel;
            levelUp();
        }
        
        // Boost recharge
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
    
    // Animate obstacles
    for (let obstacle of activeObstacles) {
        if (!obstacle.active) continue;
        obstacle.mesh.rotation.y += delta * obstacle.rotSpeed;
    }
    
    // Animate particles
    const positions = particles.geometry.attributes.position.array;
    const effectiveSpeed = gameState.isPlaying ? 
        (gameState.boostActive ? gameState.speedMultiplier * CONFIG.boostPower : gameState.speedMultiplier) : 1;
    
    for (let i = 0; i < CONFIG.particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 2] += particleVel[i] * effectiveSpeed * delta * 15;
        
        if (positions[i3 + 2] > 50) {
            positions[i3 + 2] = -50;
            positions[i3] = (Math.random() - 0.5) * 50;
            positions[i3 + 1] = (Math.random() - 0.5) * 50;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    
    // Animate tunnel
    const time = Date.now() * 0.0002;
    tubeLines.material.color.setHSL((time * 0.3) % 1, 1, 0.5);
    
    composer.render();
}

// ===== UI =====
function updateHUD() {
    el.scoreValue.textContent = Math.floor(gameState.score);
    el.levelValue.textContent = gameState.level;
    el.boostBar.style.width = gameState.boostCharge + '%';
}

function levelUp() {
    gameState.speedMultiplier += CONFIG.speedIncrement;
    gameState.moveSpeed += CONFIG.moveSpeedIncrement;
    
    gameState.currentObstacleCount = Math.min(
        CONFIG.obstacleBaseCount + (gameState.level - 1) * CONFIG.obstacleIncrementPerLevel,
        CONFIG.obstacleMaxCount
    );
    
    spawnObstacles(gameState.currentObstacleCount);
    
    gsap.to(el.levelValue, {
        scale: 1.5,
        duration: 0.2,
        yoyo: true,
        repeat: 1
    });
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
    
    el.hud.classList.add('active');
    
    gsap.to(el.startScreen, {
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
            el.startScreen.style.display = 'none';
        }
    });
}

function endGame() {
    gameState.isPlaying = false;
    
    const isNewHighScore = gameState.score > gameState.highScore;
    if (isNewHighScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('hyperspace_highscore', gameState.highScore);
    }
    
    if (gameState.level > gameState.bestLevel) {
        gameState.bestLevel = gameState.level;
        localStorage.setItem('hyperspace_bestlevel', gameState.bestLevel);
    }
    
    el.finalScore.textContent = Math.floor(gameState.score);
    el.finalHighScore.textContent = Math.floor(gameState.highScore);
    el.finalLevel.textContent = gameState.level;
    
    el.hud.classList.remove('active');
    el.gameOver.classList.add('active');
    
    gsap.to(bloomPass, {
        strength: 3.0,
        duration: 0.3,
        yoyo: true,
        repeat: 1
    });
}

function returnToMenu() {
    el.gameOver.classList.remove('active');
    el.hud.classList.remove('active');
    
    gsap.to(el.startScreen, {
        opacity: 1,
        duration: 0.4,
        onStart: () => {
            el.startScreen.style.display = 'flex';
        }
    });
    
    el.highScoreDisplay.textContent = Math.floor(gameState.highScore);
    el.bestLevelDisplay.textContent = gameState.bestLevel;
}

// ===== EVENT LISTENERS =====
el.startBtn.addEventListener('click', startGame);
el.restartBtn.addEventListener('click', () => {
    el.gameOver.classList.remove('active');
    startGame();
});
el.mainMenuBtn.addEventListener('click', returnToMenu);

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
                    el.loadingScreen.style.display = 'none';
                    el.startScreen.style.display = 'flex';
                    gsap.to(el.startScreen, { opacity: 1, duration: 0.5 });
                }
            });
        }, 300);
    }
    
    el.loadingProgress.style.width = loadProgress + '%';
}, 150);

// Update menu stats
el.highScoreDisplay.textContent = Math.floor(gameState.highScore);
el.bestLevelDisplay.textContent = gameState.bestLevel;

// ===== RESIZE =====
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    }, 100);
});

// Prevent pull-to-refresh on mobile
document.body.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// Lock orientation on mobile if possible
if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {
        // Orientation lock not supported or failed, continue anyway
    });
}

animate();
