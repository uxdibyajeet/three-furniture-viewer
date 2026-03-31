import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { DRACOLoader } from "three/examples/jsm/Addons.js";
// scene
const myScene = new THREE.Scene();
myScene.background = new THREE.Color(0x222222);

// Renderer - canvas
// defaults
  let screenWidth = window.innerWidth; //fetch browser width 
  let screenHeight = window.innerHeight; //fetch browser height
const threeRenderer = new THREE.WebGLRenderer({antialias: true});
threeRenderer.setSize(screenWidth, screenHeight); //renderer
document.body.appendChild(threeRenderer.domElement);

// camera element
const fieldOfView = 75;
const aspectRatio = screenWidth / screenHeight;
const near = 0.1;
const far = 1000;
const mainCamera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, near, far);
const controls = new OrbitControls(mainCamera, threeRenderer.domElement);
controls.enableDamping = true // This adds "weight" so it doesn't stop instantly
mainCamera.position.z = 5;

// model
let currentModel;

// lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
myScene.add(light);
  //ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 1.0);
  myScene.add(ambient);

// looping rotation animation
function animate() {
  requestAnimationFrame(animate);
  
  if (currentModel) {
    currentModel.rotation.y += 0.0025;
  }
  // cube.rotation.y += 0.0025;

  controls.update(); // orbit controls
  threeRenderer.render(myScene, mainCamera); // this appends the canvas into the screen
}
animate();

// Setup draco decoder
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// importing custom model
gltfLoader.load ('./models/Chair_01.glb', (gltf) => {
  currentModel = gltf.scene;
  const box = new THREE.Box3().setFromObject(currentModel);
  const center = box.getCenter(new THREE.Vector3());
  currentModel.position.y = -1.75;
  currentModel.scale.set(1.5, 1.5, 1.5);
  currentModel.position.x += (currentModel.position.x - center.x);
  currentModel.position.z += (currentModel.position.z - center.z);
  myScene.add(currentModel);
  console.log("Chair Loaded Successfully");
}, (xhr) => {
  console.log((xhr.loaded / xhr * 100) + '% loaded');
}, (error) => {
  console.error('An error happened...');
});

// responsive canvas size
window.addEventListener('resize', () => {
  // Recalculate sizes
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  
  // Update Camera
  mainCamera.aspect = screenWidth / screenHeight;
  mainCamera.updateProjectionMatrix();
  threeRenderer.setSize(screenWidth, screenHeight);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});