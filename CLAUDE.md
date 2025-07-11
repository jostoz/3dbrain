# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start Development Server:**
```bash
npm run dev
```
Runs Vite dev server on `http://localhost:3000`

**Build for Production:**
```bash
npm run build
```

**Linting:**
```bash
npm run lint
```
ESLint with Airbnb config, auto-fixes issues

**Testing:**
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:clean    # Clean coverage
```

**Typecheck and Build Validation:**
After making changes, always run `npm run build` to ensure Three.js compatibility and catch any import/export issues.

## Architecture Overview

### Core Application Structure
- **Entry Point:** `src/app.js` - Initializes MainBrain without container parameter
- **Base Class:** `AbstractApplication` - Handles Three.js renderer, camera, scene, and post-processing setup
- **Main Class:** `MainBrain extends AbstractApplication` - Orchestrates brain visualization, particle systems, and animations

### Key Architectural Patterns

**Inheritance-Based Scene Management:**
```javascript
class MainBrain extends AbstractApplication {
  constructor() {
    super(); // No container - uses document.body directly
  }
}
```

**Asset Loading Pipeline:**
1. `Loaders` class manages OBJ models, textures, fonts, and skybox
2. `runAnimation()` callback triggered when all assets loaded
3. Brain model processed into particle system geometry

**State Management:**
- `BrainStateManager` handles transitions between brain states (LOADING, READY, TRANSITIONING)
- State updates trigger animations and particle system changes

### Particle System Architecture

**Brain Rendering Approach:**
1. OBJ model (`BrainUVs.obj`) loaded and parsed for mesh geometry
2. Vertex data extracted and merged using `BufferGeometryUtils.mergeGeometries()`
3. `ParticleSystem` converts brain geometry into animated particles
4. Multiple particle systems: main brain, bubbles, thinking animations

**Critical Dependencies:**
- `three-bas` (Buffer Animation System) from GitHub fork for advanced particle effects
- `postprocessing@6.35.3` specifically for Three.js 0.162 compatibility
- GLSL shaders in `src/js/shaders/` for particle and x-ray effects

### Animation System Architecture

**Multiple Animation Layers:**
- `BubblesAnimation` - Memory bubble effects
- `ThinkingAnimation` - Neural activity visualization  
- `xRayAnimation` - Brain x-ray overlay effects
- GSAP integration for smooth transitions

**Memory System:**
- Static memory data in `src/js/data/memories.json`
- Dynamic memory selection affects particle colors and animations
- State-driven memory transitions

## Development Notes

**Three.js Version Constraints:**
- Locked to Three.js 0.162 due to `three-bas` compatibility
- Use `three/examples/jsm/` import paths for examples
- `BufferGeometryUtils` import: `'three/examples/jsm/utils/BufferGeometryUtils.js'`

**Asset Path Structure:**
- Models: `static/models/` (served from `public/static/`)
- Textures: `static/textures/`
- Fonts: `static/fonts/`

**Rendering Pipeline:**
- Uses `EffectComposer` with bloom effects from `postprocessing` library
- Custom render loop in `MainBrain.animate()`
- OrbitControls for camera interaction

**GLSL Shader Integration:**
- Vite plugin handles `.glsl` file imports
- Shader chunks system in `src/js/services/chunks.js`
- Custom vertex/fragment shaders for particles and effects

**GUI System:**
- `lil-gui` for debug controls (migrated from dat.gui)
- Controls particle parameters, lighting, animations
- Import as `{ GUI as DatGUI }` to avoid naming conflicts

## Common Issues

**Build Failures:**
- Check for Three.js API compatibility when updating versions
- Verify `postprocessing` version matches Three.js version
- GLSL shader compilation errors appear during build

**Asset Loading:**
- Brain model must exist at `public/static/models/BrainUVs.obj`
- Missing assets cause loader to hang indefinitely
- Check browser console for 404 errors on asset paths

**Particle System Issues:**
- If particles don't render, check `endPointsCollections` is properly merged
- Shader compilation errors prevent particle system initialization
- Camera position (z: 1000) requires large-scale objects for visibility