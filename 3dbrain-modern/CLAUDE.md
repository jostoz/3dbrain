# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start Vite development server on port 3000 with hot reload
- `npm run build` - Build production bundle with tree-shaking and optimization
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## Project Architecture

### Modern Tech Stack
This is a lightweight, modern reimplementation using:
- **Three.js 0.168+**: Latest WebGL 3D library with modern imports (`/examples/jsm/`)
- **Vite 5**: Fast build tool with native ES modules
- **GSAP 3**: Professional animation library
- **lil-gui**: Modern lightweight GUI (replaces dat-gui)

### Core Components Structure

1. **main.js** - Application orchestrator
   - Initializes Three.js scene, camera, renderer
   - Sets up post-processing pipeline with UnrealBloomPass
   - Manages GUI controls and event listeners
   - Coordinates component updates in animation loop

2. **ParticleSystem.js** - Brain particle visualization
   - Custom BufferGeometry with brain-like mathematical shape generation
   - Custom ShaderMaterial with vertex/fragment shaders for particle effects
   - Dynamic particle count, size, and color management
   - Implements breathing animation and gentle rotation

3. **BrainVisualization.js** - Wireframe brain and neural networks
   - Deformed sphere geometry for brain-like structure
   - Animated neural pathway tubes using CatmullRomCurve3
   - Memory region spheres with glow effects
   - Region activation/highlighting system

### Key Technical Decisions

#### Particle System Implementation
- **Mathematical brain shape**: Uses spherical coordinates with cortex deformation instead of loading OBJ models
- **Custom shaders**: Vertex shader handles pulsing effects, fragment shader creates circular particles with soft edges
- **BufferGeometry**: Efficient for thousands of particles with position, color, and size attributes
- **Additive blending**: Creates luminous particle effects without depth sorting issues

#### Modern Three.js Patterns
- **ES Module imports**: `import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'`
- **BufferGeometry everywhere**: No legacy Geometry usage
- **Shader uniforms**: Time-based animations via uniform updates
- **Component disposal**: Proper memory management with dispose() methods

#### Performance Optimizations
- **GPU-side animations**: Particle pulsing handled in vertex shader
- **Frustum culling**: Automatic with Three.js renderer
- **Power-of-2 textures**: Where applicable for GPU efficiency
- **Adaptive pixel ratio**: Limited to max 2 for performance

### Development Patterns

#### Adding New Visual Effects
1. Create component class in `src/components/`
2. Implement `init()`, `update()`, and `dispose()` methods
3. Add to main application scene in `main.js`
4. Connect to GUI controls if needed

#### Shader Development
- Store shaders inline in component files for simplicity
- Use `uniforms` for time-based animations
- Implement `varying` variables for vertex-to-fragment data
- Test shader compilation with error handling

#### Animation Integration
- Use GSAP for camera movements and intro sequences
- Handle continuous animations in component `update()` methods
- Coordinate timing via shared time variables
- Implement easing with GSAP's power curves

## Common Development Tasks

### Adding New Particle Effects
```javascript
// In ParticleSystem.js, modify vertex shader
uniform float newEffect;
// Add to fragment shader for visual changes
```

### Creating Brain Regions
```javascript
// In BrainVisualization.js
const newRegion = {
  name: 'New Region',
  pos: [x, y, z],
  color: 0xffffff
}
```

### Performance Monitoring
- Use built-in FPS counter in UI
- Monitor particle count display
- Check browser DevTools for GPU usage
- Profile with Three.js stats if needed

## Known Technical Constraints

### Browser Compatibility
- Requires WebGL 2.0 support (modern browsers)
- Uses ES modules natively (no IE support)
- Shader precision may need adjustment for Safari

### Performance Limits
- Default 5000 particles for 60fps on average hardware
- Post-processing effects scale with screen resolution
- Mobile devices may need reduced particle counts

### Vite Specific
- Hot module reload works with component changes
- Shader changes require manual refresh
- Build output optimized with tree-shaking

## Migration Notes from Legacy Project

### What Changed
- **Dependencies**: Removed webpack, babel complexity
- **Imports**: Modern `/examples/jsm/` instead of `/examples/js/`
- **Build**: Vite replaces Webpack 3 configuration
- **Particles**: Custom math-based generation replaces three-bas library
- **Post-processing**: UnrealBloomPass replaces legacy BloomPass
- **GUI**: lil-gui replaces dat-gui

### Architecture Benefits
- **Bundle size**: ~90% smaller than legacy version
- **Development speed**: Instant hot reload with Vite
- **Maintenance**: No complex build configuration
- **Future-proof**: Uses latest web standards

This modern implementation prioritizes simplicity, performance, and maintainability while preserving the visual impact of the original 3D brain visualization.