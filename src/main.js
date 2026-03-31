import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { DRACOLoader } from "three/examples/jsm/Addons.js";
import { HDRLoader } from "three/examples/jsm/Addons.js";

//Scene SETUP
const myScene = new THREE.Scene();
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

// Renderer
const threeRenderer = new THREE.WebGLRenderer({ antialias: true });
threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
threeRenderer.outputColorSpace = THREE.SRGBColorSpace;
threeRenderer.setSize(screenWidth, screenHeight);
threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(threeRenderer.domElement);

// Camera & Controls
const mainCamera = new THREE.PerspectiveCamera(75, screenWidth / screenHeight, 0.1, 1000);
mainCamera.position.z = 5;
const controls = new OrbitControls(mainCamera, threeRenderer.domElement);
controls.enableDamping = true;

// Light Assets
const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(2, 2, 5);
myScene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.8);
myScene.add(ambient);

// Master Scene Controller
function updateSceneVisuals({ 
    exposure = 1.4, 
    bgHex = "#D99D26", 
    envBlur = 0.5, 
    envIntensity = 1.2,
    lightColor = 0xffffff,
    lightIntensity = 2.5
}) {
    // 1. Tone Mapping
    threeRenderer.toneMappingExposure = exposure;

    // 2. Background (Figma Color Match)
    const finalBgColor = new THREE.Color(bgHex).convertSRGBToLinear();
    myScene.background = finalBgColor;

    // 3. HDRI Control
    myScene.backgroundBlurriness = envBlur;
    myScene.environmentIntensity = envIntensity;

    // 4. Lights
    light.color.set(lightColor);
    light.intensity = lightIntensity;
    ambient.color.set(lightColor);
    ambient.intensity = lightIntensity * 0.5;
}

// Environment HDRI Lighting
let currentIndex = 0;
const hdriLoader = new HDRLoader().load(
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr', 
    (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        myScene.environment = texture;
        const currentVisuals = furnitureData[currentIndex].visuals;
        updateSceneVisuals(currentVisuals);
    }
);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let currentModel;

gltfLoader.load('./models/Chair_02.glb', (gltf) => {
    currentModel = gltf.scene;
    
    // Center logic
    const box = new THREE.Box3().setFromObject(currentModel);
    const center = box.getCenter(new THREE.Vector3());
    
    currentModel.position.y = -1.75;
    currentModel.scale.set(1.5, 1.5, 1.5);
    currentModel.position.x += (currentModel.position.x - center.x);
    currentModel.position.z += (currentModel.position.z - center.z);
    
    myScene.add(currentModel);
    console.log("Model Loaded Successfully");
});

/**
 * 5. ANIMATION & RESPONSIVENESS
 */
function animate() {
    requestAnimationFrame(animate);
    if (currentModel) {
        currentModel.rotation.y += 0.00025;
    }
    controls.update();
    threeRenderer.render(myScene, mainCamera);
}
animate();

window.addEventListener('resize', () => {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    
    mainCamera.aspect = screenWidth / screenHeight;
    mainCamera.updateProjectionMatrix();
    
    threeRenderer.setSize(screenWidth, screenHeight);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * 6. UI & DATA
 */
const furnitureData = [
    {
      id: 0,
      name: "Geometric Accent Chair",
      description: "Handcrafted with premium ash wood and velvet upholstery. A study in post-modern silhouettes.",
      specs: ["W: 75cm", "D: 80cm", "H: 95cm"],
      visuals: {
        exposure: 0.5, 
        bgHex: "#f0f0f0", 
        envBlur: 0.25,
        envIntensity: 1.0,
        lightIntensity: 1.0
      }
    }
];

function openModal(itemIndex) {
    const item = furnitureData[itemIndex];
    if (!item) return;

    document.querySelector('.modelTitle').textContent = item.name;
    document.querySelector('.modelDesc').textContent = item.description;
    
    const specsList = document.querySelector('#modelSpecs');
    specsList.innerHTML = item.specs.map(s => `<li>${s}</li>`).join('');
    
    document.querySelector('.modal').classList.remove('hidden');
}