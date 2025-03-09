import * as THREE from "three/webgpu";
import { texture, uv, time, vec2, uniform } from "three/tsl";

const textureLoader = new THREE.TextureLoader();

function loadPixPalTexture(path: string) {
  const texture = textureLoader.load(path);

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;

  return texture;
}

type PixPalTextures = {
  baseColor: THREE.Texture;
  emission: THREE.Texture;
  attributes: THREE.Texture;
};

export function createPixPalTextures(
  baseColorTextureUrl: string,
  emissionTextureUrl: string,
  attributesTextureUrl: string,
): PixPalTextures {
  return {
    baseColor: loadPixPalTexture(baseColorTextureUrl),
    emission: loadPixPalTexture(emissionTextureUrl),
    attributes: loadPixPalTexture(attributesTextureUrl),
  };
}

export class PixPalNodeMaterial extends THREE.MeshStandardNodeMaterial {
  uniforms = {
    emissiveIntensity: uniform(1),
    effectSpeed: uniform(1),
  };

  constructor(
    pixpalTextures: PixPalTextures,
    parameters?: THREE.MeshStandardNodeMaterialParameters,
  ) {
    super(parameters);

    const baseUv = uv();

    const sampledAttribute = texture(pixpalTextures.attributes, baseUv);

    const metalnessNode = sampledAttribute.r;
    const roughnessNode = sampledAttribute.g.oneMinus();
    const scrollingMask = sampledAttribute.b;

    const animatedUv = vec2(
      baseUv.x,
      baseUv.y.add(scrollingMask.mul(time.mul(this.uniforms.effectSpeed))),
    );

    const colorNode = texture(pixpalTextures.baseColor, animatedUv);

    const emissiveNode = texture(pixpalTextures.emission, animatedUv).mul(
      this.uniforms.emissiveIntensity,
    );

    this.colorNode = colorNode;
    this.metalnessNode = metalnessNode;
    this.roughnessNode = roughnessNode;
    this.emissiveNode = emissiveNode;
  }
}
