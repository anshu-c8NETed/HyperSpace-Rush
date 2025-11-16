# 🚀 HYPERSPACE RUSH

<div align="center">

![Hyperspace Rush Banner](https://img.shields.io/badge/HYPERSPACE-RUSH-00ffff?style=for-the-badge&logo=spacex&logoColor=white)

**An immersive 3D endless runner racing game built with Three.js**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Three.js](https://img.shields.io/badge/Three.js-r161-black.svg)](https://threejs.org/)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Mobile](https://img.shields.io/badge/mobile-optimized-ff00ff.svg)]()

[🎮 Play Now](#installation) • [📖 Documentation](#documentation) • [🤝 Contributing](#contributing)

</div>

---

## ✨ Features

### 🎮 Gameplay
- **Endless Racing** - Navigate through a futuristic tunnel at breakneck speeds
- **Progressive Difficulty** - Levels get harder as you advance
- **Boost System** - Strategic nitro boost for speed bursts
- **Health System** - 3 lives with invulnerability frames
- **Score Tracking** - High score persistence with localStorage

### 🎨 Visuals
- **Stunning 3D Graphics** - Powered by Three.js and WebGL
- **Post-Processing Effects** - Bloom, motion blur, and cinematic rendering
- **Dynamic Lighting** - Real-time color-shifting neon aesthetic
- **Particle Systems** - 800+ animated particles for immersion
- **Smooth Animations** - GSAP-powered transitions

### 📱 Cross-Platform
- **Fully Responsive** - Works on desktop, tablet, and mobile
- **Touch Controls** - Virtual joystick and touch buttons
- **Keyboard Support** - WASD/Arrow keys + Space for boost
- **Auto-Detection** - Automatically adapts to your device
- **Performance Optimized** - 60 FPS on modern devices

### 🎯 User Experience
- **Instant Loading** - Optimized asset loading
- **Clean UI/UX** - Minimalist HUD with essential info
- **Smooth Controls** - Responsive movement with acceleration
- **Visual Feedback** - Screen shake, flashes, and effects
- **Persistent Stats** - Track your best scores and levels

---

## 🎬 Screenshots

| Menu | Gameplay | Game Over |
|------|----------|-----------|
| ![Menu](screenshot-menu.png) | ![Gameplay](screenshot-game.png) | ![Game Over](screenshot-gameover.png) |

---

## 🚀 Quick Start

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hyperspace-rush.git
cd hyperspace-rush
```

2. **Serve locally**
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

3. **Open in browser**
```
http://localhost:8000
```

### File Structure
```
hyperspace-rush/
├── index.html          # Main HTML file
├── main.js            # Game logic and Three.js setup
├── spline.js          # Racing track geometry
├── style.css          # Responsive styling
├── README.md          # This file
└── LICENSE            # MIT License
```

---

## 🎮 Controls

### Desktop
| Key | Action |
|-----|--------|
| `W` / `↑` | Move Up |
| `S` / `↓` | Move Down |
| `A` / `←` | Move Left |
| `D` / `→` | Move Right |
| `SPACE` | Activate Boost |

### Mobile
- **Virtual Joystick** (bottom-left) - Movement in all directions
- **BOOST Button** (bottom-right) - Nitro speed burst

---

## 🛠️ Technical Details

### Technologies Used
- **Three.js r161** - 3D graphics rendering
- **GSAP 3.12** - Animation library
- **WebGL** - Hardware-accelerated rendering
- **ES6 Modules** - Modern JavaScript
- **CSS3** - Responsive design
- **HTML5** - Semantic markup

### Key Components

#### 🎮 Game Loop
```javascript
// 60 FPS game loop with delta timing
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    
    if (gameState.isPlaying) {
        updateCamera(delta);
        checkCollisions();
        updateHUD();
    }
    
    composer.render();
}
```

#### 🌊 Track Generation
```javascript
// Procedural racing track using Catmull-Rom spline
const spline = new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.5);
const tubeGeo = new THREE.TubeGeometry(spline, 300, 0.65, 16, true);
```

#### 💥 Post-Processing
```javascript
// Bloom effect for neon glow
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,  // strength
    0.4,  // radius
    0.85  // threshold
);
```

### Performance Optimization
- ✅ Object pooling for obstacles (no garbage collection)
- ✅ Reduced particle count on mobile (800 vs 1200)
- ✅ Conditional antialiasing (desktop only)
- ✅ Efficient collision detection (squared distance)
- ✅ RequestAnimationFrame for smooth rendering
- ✅ Texture compression and reuse

---

## 📊 Game Mechanics

### Difficulty Scaling
```javascript
Level 1:  15 obstacles @ 2.0x speed
Level 5:  35 obstacles @ 2.6x speed
Level 10: 60 obstacles @ 3.2x speed (capped)
```

### Scoring System
- **Base Score**: 20 points/second
- **Boost Multiplier**: 2.0x during nitro
- **Level Threshold**: 150 points per level

### Health System
- **3 Lives** (3 health bars)
- **1 Second Invulnerability** after taking damage
- **Visual Feedback**: Screen shake + red flash
- **Game Over**: When health reaches 0

---

## 🎨 Customization

### Modify Game Difficulty
Edit `CONFIG` object in `main.js`:
```javascript
const CONFIG = {
    baseSpeed: 2.0,              // Starting speed
    obstacleBaseCount: 15,        // Initial obstacles
    boostPower: 2.0,             // Boost multiplier
    levelScoreThreshold: 150,    // Points per level
    // ... more settings
};
```

### Change Color Scheme
Modify CSS variables in `style.css`:
```css
:root {
    --cyan: #00ffff;      /* Primary color */
    --magenta: #ff00ff;   /* Secondary color */
    --yellow: #ffff00;    /* Accent color */
}
```

### Adjust Track Layout
Edit control points in `spline.js`:
```javascript
const curvePath = [
    15.0, 0.0, 0.0,   // [x, y, z] coordinates
    12.0, 0.0, 0.0,
    // ... add more points
];
```

---

## 🐛 Known Issues

- [ ] Safari mobile may have reduced performance on older devices
- [ ] Orientation lock may not work on all browsers
- [ ] High DPI displays may see slight blur on text

---

## 🚀 Roadmap

### Version 1.1 (Planned)
- [ ] Power-ups (shields, score multipliers)
- [ ] Multiple track variations
- [ ] Sound effects and music
- [ ] Leaderboard integration
- [ ] More visual effects (trails, explosions)

### Version 1.2 (Future)
- [ ] Multiplayer race mode
- [ ] Daily challenges
- [ ] Unlockable ships/skins
- [ ] Progressive Web App (PWA)
- [ ] Social sharing

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create your feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Test on multiple devices
- Update documentation
- Keep commits atomic and descriptive

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Hyperspace Rush

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- **Three.js** - Amazing 3D library
- **GSAP** - Smooth animations
- **RemixIcon** - Beautiful icons
- **Google Fonts** - Orbitron & Rajdhani fonts
- Inspired by classic racing games like F-Zero and Wipeout

---

## 📧 Contact

**Project Maintainer** - [@yourusername](https://github.com/yourusername)

**Project Link** - [https://github.com/yourusername/hyperspace-rush](https://github.com/yourusername/hyperspace-rush)

---

<div align="center">

### ⭐ Star this repo if you enjoyed the game!

Made with ❤️ and ☕ by passionate developers

[Report Bug](https://github.com/yourusername/hyperspace-rush/issues) • [Request Feature](https://github.com/yourusername/hyperspace-rush/issues)

</div>
