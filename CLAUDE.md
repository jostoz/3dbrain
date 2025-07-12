# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on port 8081 with hot reload
- `npm run build` - Build production bundle
- `npm run lint` - Run ESLint with auto-fix for code style
- `npm start` - Alias for `npm run dev`

### Testing
- `npm test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:watchAll` - Run all tests in watch mode
- `npm run test:clean` - Clean test coverage reports
- `npm run test:coverage:report` - Open coverage report in browser

### Deployment
- `npm run deploy` - Build and deploy to Firebase hosting

## Critical Dependency Information

**⚠️ IMPORTANT**: This project uses specific legacy dependency versions that are required for compatibility. DO NOT update these without extensive testing:

- **Three.js**: 0.91.0 (uses `/examples/js/` imports, not modern `/examples/jsm/`)
- **Webpack**: 3.10.0 (configuration incompatible with Webpack 4+)
- **postprocessing**: 4.5.0 (uses `BloomPass`, not modern `BloomEffect`/`EffectPass`)
- **babel-core**: 6.22.1 (required for babel-loader 7.1.1)

The `original-working-state` branch contains the stable, functional version based on commit `ab26234f5e7553b59aeb766da6d3c46653b11dca`.

## Architecture Overview

### Core Application Structure
The project follows a modular Three.js architecture with these key components:

1. **MainBrain** (`src/js/MainBrain.js`) - Main application class extending AbstractApplication
   - Orchestrates the entire 3D brain visualization
   - Manages animation timeline and memory demonstrations
   - Loads brain models via OBJLoader and processes geometry

2. **AbstractApplication** (`src/js/views/AbstractApplication.js`) - Base Three.js setup
   - Initializes WebGL renderer, scene, camera, and post-processing pipeline
   - Sets up OrbitControls for user interaction
   - Configures BloomPass for visual effects

3. **ParticleSystem** (`src/js/services/particlesSystem.js`) - **CRITICAL COMPONENT**
   - Originally used `three-bas` library but was completely rewritten to use standard Three.js
   - Renders brain structure as particle points using BufferGeometry and PointsMaterial
   - Manages X-Ray wireframe overlay effects

### Animation Systems
- **BubblesAnimation** - Memory bubble effects floating around brain regions
- **ThinkingAnimation** - Flashing particle effects for cognitive activity
- **GSAP Integration** - Timeline-based animations using TweenMax and Power4 easing

### Data Flow
1. **Loaders** class loads 3D brain model (BrainUVs.obj) from static/models/
2. **MainBrain** processes loaded geometry and extracts brain regions
3. Geometry merged using `THREE.BufferGeometryUtils.mergeBufferGeometries()`
4. **ParticleSystem** converts merged geometry to particle visualization
5. **Memory system** maps brain regions to cognitive functions via memories.json

### Shader System
- Custom GLSL shaders in `src/js/shaders/` for specialized visual effects
- Glslify integration for modular shader development
- Post-processing pipeline with bloom effects for luminous brain appearance

## Key Technical Constraints

### Three.js API Usage
- Uses legacy Three.js 0.91.0 import patterns: `import "three/examples/js/controls/OrbitControls"`
- BufferGeometry manipulation requires understanding of pre-r125 Three.js APIs
- Material properties and renderer setup follow older Three.js conventions

### Build System Specifics
- Webpack 3 configuration with custom loaders for GLSL, OBJ files
- Babel transpilation with stage-2 presets for experimental JS features
- ESLint rules configured for legacy JavaScript patterns

### Performance Considerations
- Brain model contains thousands of vertices requiring efficient particle rendering
- Post-processing effects must maintain 60fps on moderate hardware
- Memory animations should not interfere with core brain visualization performance

## Common Issues and Solutions

### Dependency Update Attempts
If attempting to modernize dependencies, be aware that:
- Three.js imports will need complete restructuring to `/examples/jsm/` format
- Webpack configuration requires full migration to v4+ APIs
- postprocessing library API changed completely (BloomPass → BloomEffect + EffectPass)
- three-bas library is no longer maintained and incompatible with modern Three.js

### Particle System Debugging
The ParticleSystem was rewritten to replace three-bas. If brain doesn't render:
1. Check console for "ParticleSystem initialized successfully" message
2. Verify brain model loaded correctly in Network tab
3. Ensure BufferGeometryUtils is properly importing Three.js utils

### Build Failures
- Always use `npm install --legacy-peer-deps` if encountering dependency conflicts
- ESLint warnings about `++` operators are expected and don't prevent compilation
- If webpack compilation hangs, revert to exact package.json dependency versions

## Development Context

This is a 3D brain visualization experiment originally created in 2018. The project demonstrates:
- Real-time 3D particle systems representing neural structures
- Interactive brain exploration with memory region highlighting
- Sophisticated visual effects using Three.js and post-processing
- Educational visualization of cognitive processes through animated sequences

The codebase represents a "golden state" where all dependencies are compatible. Future development should prioritize functionality over modernization unless a complete rewrite is planned.