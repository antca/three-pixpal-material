import * as THREE from "three/webgpu";
import {
  blendColor,
  emissive,
  metalness,
  mrt,
  output,
  pass,
  transformedNormalView,
  Fn,
} from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { smaa } from "three/addons/tsl/display/SMAANode.js";
import { ssr } from "three/addons/tsl/display/SSRNode.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MapControls } from "three/addons/controls/MapControls.js";
import { SkyMesh } from "three/addons/objects/SkyMesh.js";

import { PixPalNodeMaterial, createPixPalTextures } from "three-pixpal-material";

// Textures loading
const textures = createPixPalTextures(
  "/textures/ImphenziaPixPal_BaseColor.png",
  "/textures/ImphenziaPixPal_Emission.png",
  "/textures/ImphenziaPixPal_Attributes.png",
);

const gltfLoader = new GLTFLoader();
const gltf = await gltfLoader.loadAsync("./Imphenzia-PixPal.glb");

// Scene setup
const scene = new THREE.Scene();
scene.add(gltf.scene);

const material = new PixPalNodeMaterial(textures);
scene.traverse((object) => {
  if (object.isMesh) {
    object.material = material;
    if (object.name !== "PixPalSign") {
      object.receiveShadow = true;
      object.castShadow = true;
    }
  }
  if (object.isLight && object.isPointLight) {
    if (["Point003"].includes(object.name)) {
      object.visible = false;
      return;
    }
    object.intensity = object.intensity / 300;
  }
});

const elevation = 0.1;
const azimuth = 30;
const phi = THREE.MathUtils.degToRad(90 - elevation);
const theta = THREE.MathUtils.degToRad(azimuth);
const sunPosition = new THREE.Vector3();
sunPosition.setFromSphericalCoords(1, phi, theta);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0);
directionalLight.position.copy(sunPosition.multiplyScalar(10));
directionalLight.position.y += 5;
directionalLight.castShadow = true;
directionalLight.shadow.bias = -0.001;
scene.add(directionalLight);

// Camera
const camera = new THREE.PerspectiveCamera();
camera.position.set(6, 5, -8);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGPURenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
window.document.body.append(renderer.domElement);

// Sky and environment setup
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const sceneEnv = new THREE.Scene();

const sky = new SkyMesh();
sky.turbidity.value = 10;
sky.rayleigh.value = 2;
sky.sunPosition.value.copy(sunPosition);
sceneEnv.add(sky);

const renderTarget = await pmremGenerator.fromSceneAsync(sceneEnv);
scene.environment = renderTarget.texture;
scene.background = renderTarget.texture;

// Postprocessing
const postprocessing = new THREE.PostProcessing(renderer);

const scenePass = pass(scene, camera);
scenePass.setMRT(
  mrt({
    output,
    emissive,
    metalness,
    transformedNormalView,
  }),
);

const scenePassColor = scenePass.getTextureNode("output");
const scenePassNormal = scenePass.getTextureNode("transformedNormalView");
const scenePassDepth = scenePass.getTextureNode("depth");
const scenePassMetalness = scenePass.getTextureNode("metalness");
const emissivePass = scenePass.getTextureNode("emissive");

const bloomPass = bloom(emissivePass);

const ssrPass = ssr(
  scenePassColor,
  scenePassDepth,
  scenePassNormal,
  scenePassMetalness,
  camera,
);
ssrPass.resolutionScale = 1.0;

const outputNode = smaa(blendColor(scenePassColor, ssrPass).add(bloomPass));

postprocessing.outputNode = outputNode;

// Animation
const mixer = new THREE.AnimationMixer(scene);
const action = mixer.clipAction(gltf.animations[0]);
action.play();

// Camera controls
new MapControls(camera, renderer.domElement);

// Update loop
let prevLoopTimeMs = 0;
function loop(timeMs) {
  const deltaMs = timeMs - prevLoopTimeMs;
  mixer.update(deltaMs / 1000);

  postprocessing.render();

  prevLoopTimeMs = timeMs;
}
renderer.setAnimationLoop(loop);

// Viewport size update
function updateSize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}
window.addEventListener("resize", updateSize);
updateSize();
