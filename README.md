# Three PixPal Material

A Three.js implementation of Imphenzia's PixPal material system.

## About

This project is based on [Imphenzia's PixPal Palette](https://www.youtube.com/imphenzia), a creative texture and shader system for colorizing 3D low-poly assets. The implementation provides a Three.js material that uses the same texture system as the original.

This material is implemented using Three.js Shader Language (TSL) and requires the WebGPURenderer.

## Installation

You can install this package using npm:

```bash
npm install three-pixpal-material
```

The package includes the necessary PixPal textures in the `node_modules/three-pixpal-material/textures` directory:
- `ImphenziaPixPal_BaseColor.png`
- `ImphenziaPixPal_Emission.png`
- `ImphenziaPixPal_Attributes.png`

You can copy these textures to your project's assets directory or serve them from your web server.

## Usage

```javascript
import * as THREE from 'three/webgpu';
import { createPixPalTextures, PixPalNodeMaterial } from 'three-pixpal-material';

// Set up WebGPU renderer
const renderer = new THREE.WebGPURenderer();

// Load textures using URLs (not file paths)
const textures = createPixPalTextures(
  '/assets/textures/ImphenziaPixPal_BaseColor.png',
  '/assets/textures/ImphenziaPixPal_Emission.png',
  '/assets/textures/ImphenziaPixPal_Attributes.png'
);

// Create material
const material = new PixPalNodeMaterial(textures);

// Use with a mesh
const mesh = new THREE.Mesh(geometry, material);
```

### Important Requirements

1. **WebGPU Renderer**: This material requires the WebGPU renderer from Three.js:
   ```javascript
   import * as THREE from 'three/webgpu';
   const renderer = new THREE.WebGPURenderer();
   ```

## Texture Settings

For best results, ensure your textures have the following settings:

- **Filtering**: Use Nearest Neighbor / Point filtering (not bilinear or bicubic)
- **Compression**: Do not use texture compression
- **Mipmaps**: Disable mipmaps
- **Wrapping**: Use Wrap/Repeat mode (not Clamp)

These settings are automatically applied when using the `createPixPalTextures` function.

## Examples

Check out the examples directory for a demonstration of how to use the material:

- `examples/Imphenzia-PixPal`: A showcase example using the original Imphenzia sample assets

### Running the Examples

To run the examples, follow these steps:

1. Build the package:
   ```bash
   npm run examples:build
   ```

2. Start the local development server:
   ```bash
   npm run examples:serve
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080/
   ```

## Building

```bash
# Build the package
npm run build

# Clean and build
npm run clean:build
```

## License

### Code and Implementation
The Three.js implementation of the PixPal material system is licensed under the CC0-1.0 license (Creative Commons Zero v1.0 Universal).

### Textures, Materials and Shaders
The original textures, materials, and shader concepts by Imphenzia are licensed under CC0 (Creative Commons Zero - Public Domain). This includes:

- ImphenziaPixPal_BaseColor.png
- ImphenziaPixPal_Emission.png
- ImphenziaPixPal_Attributes.png

### Showcase Sample Assets
The showcase sample assets in the examples directory (such as the GLB file) are **NOT** covered by the CC0 license. These assets are copyright by Imphenzia Pty Ltd. You can purchase a license for these assets from [Imphenzia's website](https://www.imphenzia.com).

## Acknowledgements

- [Imphenzia](https://www.youtube.com/imphenzia) for creating and sharing the original PixPal palette system
- Check out Imphenzia's [YouTube channel](https://www.youtube.com/imphenzia) and [website](https://www.imphenzia.com) for more amazing content.
