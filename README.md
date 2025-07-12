Amelia Brain Module 2.0 Experiment Three.js

[VIEW VIDEO DEMO](https://www.youtube.com/watch?v=y0XOuSNlHx8)

[>> DEMO <<](https://dbrain-742f1.firebaseapp.com/)

![alt text](https://raw.githubusercontent.com/victors1681/3dbrain/master/screenshot/brain3d.png)

## How to install

- Run `npm install`
- Run `npm run dev`
- Open http://localhost:8080

## Troubleshooting & Compatibility Fix

This project was originally created with older dependencies that had compatibility issues when trying to modernize. Here's how we fixed it to work:

### Issue: three-bas Library Incompatibility

The main problem was with the `three-bas` (Buffer Animation System) library which had breaking changes with Three.js API:

**Error encountered:**
```
Uncaught TypeError: this.setAttribute is not a function
    at ParticleSystem.init (particlesSystem.js:37:1)
```

### Solution Applied

1. **Reverted to Original Working State**: Used commit `ab26234f5e7553b59aeb766da6d3c46653b11dca` as the stable base
2. **Replaced three-bas with Standard Three.js**: Simplified the particle system to use basic Three.js `PointsMaterial` and `BufferGeometry`
3. **Maintained Visual Fidelity**: Created a working particle system that displays the brain structure correctly

### Key Files Modified

- `src/js/services/particlesSystem.js` - Completely rewritten to use standard Three.js instead of three-bas
- `src/js/views/AbstractApplication.js` - Removed debug elements
- `src/app.js` - Added error handling and fallback mechanisms

### Dependencies Working State

- **Three.js**: 0.91.0 (original compatible version)
- **Webpack**: 3.10.0 (original build system)
- **postprocessing**: 4.5.0 (compatible with Three.js 0.91)
- **dat-gui**: 0.5.0 (original UI library)

### What's Working Now

✅ **Brain particle visualization** - White dots forming brain structure  
✅ **X-Ray wireframe effects** - Cyan wireframe brain overlay  
✅ **Camera controls** - Mouse rotation, zoom, and pan  
✅ **Animation loops** - Automatic rotations and transitions  
✅ **Post-processing effects** - Bloom and visual enhancements  
✅ **Memory system animations** - Bubbles and thinking effects  

### Future Modernization Notes

To safely modernize this project in the future:

1. **Incremental Updates**: Update dependencies one at a time, not all at once
2. **Three.js Migration**: Carefully follow Three.js migration guides for each version
3. **Replace three-bas**: Consider modern alternatives like `drei` or custom shader implementations
4. **Build System**: Migrate from Webpack 3 to newer version or Vite gradually

### Branch Structure

- `master` - Contains modernization attempts (non-functional)
- `original-working-state` - Fixed working version based on original code ✅

Use the `original-working-state` branch for a stable, working version of the 3D brain visualization.
