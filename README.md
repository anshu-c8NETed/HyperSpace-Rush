# 🚀 HYPERSPACE RUSH

An immersive 3D racing game built with Three.js featuring a neon-lit tunnel, dynamic obstacles, collectibles, and progressive difficulty levels.

![Hyperspace Rush](https://img.shields.io/badge/Game-Hyperspace%20Rush-cyan?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Three.js-0.161-black?style=for-the-badge&logo=three.js)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

---

## 🎮 **Game Overview**

**Hyperspace Rush** is a fast-paced, endless tunnel racing game where players navigate through a procedurally generated spline-based track. Dodge red obstacles, collect green gems, and survive as long as possible while the difficulty increases with each level!

### ✨ **Key Features**

- 🌌 **Stunning 3D Graphics**: Built with Three.js and post-processing effects (Bloom)
- 🎯 **Dynamic Gameplay**: Progressive difficulty with increasing speed and obstacles
- 💎 **Collectibles System**: Green gems worth +50 points each
- ❤️ **Health System**: 3 lives with invulnerability frames after damage
- ⚡ **Boost Mechanic**: Rechargeable turbo boost for speed bursts
- 📱 **Mobile Friendly**: Touch controls with virtual joystick and boost button
- 🎨 **Cyberpunk Aesthetic**: Neon colors, glowing effects, and futuristic UI
- 💾 **Progress Tracking**: High score and best level saved to localStorage
- 🎵 **Smooth Animations**: GSAP-powered transitions and effects

---

## 🎯 **How to Play**

### **Objective**
- Race through the endless tunnel
- Survive as long as possible
- Collect green gems for bonus points
- Avoid red obstacles that damage your ship
- Progress through levels by earning points

### **Controls**

#### **Desktop:**
- **WASD** or **Arrow Keys** - Move ship in all directions
- **SPACE** - Activate turbo boost

#### **Mobile:**
- **Virtual Joystick** (left side) - Navigate the ship
- **BOOST Button** (right side) - Activate turbo boost

### **Scoring System**
- **Base Score**: +10 points per second
- **Green Gems**: +50 points each
- **Level Up**: Every 150 points = new level
- **Speed Multiplier**: Score multiplied during boost

---

## 🛠️ **Installation & Setup**

### **Prerequisites**
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional installations required!

### **Quick Start**

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/hyperspace-rush.git
cd hyperspace-rush
```

2. **Open the game:**
   - Simply open `index.html` in your web browser
   - Or use a local server (recommended):

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using VS Code Live Server extension
# Right-click index.html > Open with Live Server
```

3. **Play the game:**
   - Navigate to `http://localhost:8000` (or your local server URL)
   - Click "HOW TO PLAY" to view instructions
   - Click "START GAME" and enjoy!

---

## 📁 **Project Structure**

```
hyperspace-rush/
├── index.html          # Main HTML file with game structure
├── style.css           # All styles including responsive design
├── main.js             # Core game logic and mechanics
├── spline.js           # Racing track spline generation
└── README.md           # Project documentation
```

### **File Descriptions**

- **`index.html`**: 
  - Game UI screens (loading, instructions, start menu, HUD, game over)
  - CDN imports for Three.js, GSAP, Remix Icons
  - Canvas rendering area

- **`style.css`**: 
  - Cyberpunk-themed styling with neon colors
  - Responsive design for mobile/tablet/desktop
  - Animations and hover effects
  - Custom button designs

- **`main.js`**: 
  - Three.js scene setup and rendering
  - Game state management
  - Player movement and collision detection
  - Obstacle and collectible spawning
  - Boost system and scoring logic

- **`spline.js`**: 
  - Catmull-Rom spline curve generation
  - Racing track path definition with elevation changes
  - Realistic corner banking and curves

---

## 🎨 **Technologies Used**

| Technology | Version | Purpose |
|------------|---------|---------|
| **Three.js** | 0.161 | 3D rendering and scene management |
| **GSAP** | 3.12.5 | Smooth animations and transitions |
| **Post-processing** | - | Bloom effects for neon glow |
| **Remix Icons** | 4.7.0 | UI icons |
| **Google Fonts** | - | Orbitron & Rajdhani fonts |
| **Vanilla JavaScript** | ES6+ | Core game logic |
| **CSS3** | - | Styling and animations |

---

## 🎮 **Game Mechanics**

### **Difficulty Progression**
- **Base Speed**: 2.0 units/second
- **Speed Increase**: +0.15 per level
- **Obstacles**: Start at 5, +2 per level (max 50)
- **Level Threshold**: 150 points per level

### **Power-ups**
- **Boost Power**: 2x speed multiplier
- **Boost Duration**: 1.5 seconds
- **Boost Recharge**: 15% per second
- **Minimum Charge**: 30% to activate

### **Health System**
- **Max Health**: 3 lives (hearts)
- **Invulnerability**: 1 second after taking damage
- **Game Over**: When health reaches 0

### **Collectibles**
- **Green Gems**: Spawn 8 per level refresh
- **Point Value**: +50 points each
- **Respawn**: New set spawns on level up

---

## 🎨 **Visual Features**

- **Particle System**: 800 animated particles for depth
- **Bloom Effect**: Glowing neon aesthetic
- **Fog System**: Dynamic depth perception
- **Wireframe Tunnel**: Color-shifting edges
- **Dynamic Lighting**: 3 light sources (ambient, directional, point)
- **Smooth Camera**: Follows spline path with offset movement
- **Responsive Design**: Adapts to all screen sizes

---

## 📱 **Mobile Optimization**

- Virtual joystick for movement control
- Touch-optimized boost button
- Reduced particle count on mobile
- Optimized rendering with `powerPreference: "high-performance"`
- Pixel ratio capping at 2x for performance
- Conditional antialiasing based on device

---

## 🏆 **Scoring & Progression**

### **Score Breakdown**
```
Base Score: 10 pts/sec × Speed Multiplier
Green Gem: 50 pts (instant)
Level Up: Every 150 points
```

### **Persistent Data**
- High Score (saved to localStorage)
- Best Level Reached (saved to localStorage)
- Displayed on start screen and game over

---

## 🐛 **Known Issues & Limitations**

- Some older mobile devices may experience lower frame rates
- Safari on iOS may have reduced particle effects
- Touch devices don't support keyboard controls

---

## 🚀 **Future Enhancements**

Potential features for future versions:

- [ ] Multiple ship designs to choose from
- [ ] Power-up variety (shield, slow-motion, magnet)
- [ ] Leaderboard system
- [ ] Sound effects and background music
- [ ] Different tunnel themes/environments
- [ ] Multiplayer race mode
- [ ] Achievement system
- [ ] Daily challenges

---

## 🤝 **Contributing**

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### **Development Guidelines**
- Follow existing code style
- Test on multiple browsers and devices
- Update README if adding new features
- Keep performance in mind for mobile devices

---

## 📄 **License**

This project is licensed under the MIT License - feel free to use, modify, and distribute as you wish.

---

## 👨‍💻 **Author**

Created with ❤️ by AN$HU

---

## 🙏 **Acknowledgments**

- **Three.js** - Amazing 3D library
- **GSAP** - Smooth animation library
- **Remix Icon** - Beautiful icon set
- Inspired by classic tunnel racing games and cyberpunk aesthetics

---

## 📞 **Support**

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Read the game instructions in-app

---

## 🌟 **Show Your Support**

If you enjoyed this game, please consider:
- ⭐ Starring the repository
- 🍴 Forking and creating your own version
- 📢 Sharing with friends and fellow developers

---

**Happy Racing! 🏁💨**

*May your reflexes be quick and your scores be high!*
