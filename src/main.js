import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { DRACOLoader } from "three/examples/jsm/Addons.js";
import { HDRLoader } from "three/examples/jsm/Addons.js";
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/Addons.js';
import { gsap } from "gsap";

//DATA
let currentIndex = 0;
const furnitureData = [
    {
      id: 0,
      name: "Geometric Accent Chair",
      description: "Handcrafted with premium ash wood and velvet upholstery. A study in post-modern silhouettes.",
      specs: ["W: 75cm", "D: 80cm", "H: 95cm"],
      path: "./models/Chair_01.glb",
      hotspotPos: { x: 0.5, y: 0.2, z: 0.6 },
      visuals: {
        exposure: 0.5, 
        bgHex: "#fafafa", 
        envBlur: 0.25,
        envIntensity: 1.0,
        lightIntensity: 1.0
      }
    },
    {
      id: 1,
      name: "Minimal Chair",
      description: "Handcrafted with premium ash wood and velvet upholstery. A study in post-modern silhouettes.",
      specs: ["W: 75cm", "D: 80cm", "H: 95cm"],
      path: "./models/Chair_02.glb",
      hotspotPos: { x: 0.5, y: 0.2, z: 0.6 },
      visuals: {
        exposure: 0.5, 
        bgHex: "#f0f0f0", 
        envBlur: 0.25,
        envIntensity: 1.0,
        lightIntensity: 1.0
      }
    }
];

// Initialize 2D Label Renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);

// Access the style through the domElement, not the renderer itself
const labelStyle = labelRenderer.domElement.style;
labelStyle.position = 'absolute';
labelStyle.top = '0';
labelStyle.left = '0';
labelStyle.pointerEvents = 'none'; // Allows OrbitControls to work "through" the labels

document.body.appendChild(labelRenderer.domElement);

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

//model loader 
function initGallery() {
  const item = furnitureData[currentIndex];
  const productTitle = document.querySelector('.productTitle');
  if (productTitle) productTitle.textContent = item.name;
  
  gltfLoader.load(item.path, (gltf) => {
    currentModel = gltf.scene;

    // 1. Center the model's geometry
    const box = new THREE.Box3().setFromObject(currentModel);
    const center = box.getCenter(new THREE.Vector3());
    currentModel.position.x += (currentModel.position.x - center.x);
    currentModel.position.z += (currentModel.position.z - center.z);
    currentModel.position.y = -1.75; 

    currentModel.scale.set(1.5, 1.5, 1.5); 
    myScene.add(currentModel);

    // 2. Attach Hotspot using your custom data coordinates
    currentModel.add(activeHotspot);
    activeHotspot.position.set(item.hotspotPos.x, item.hotspotPos.y, item.hotspotPos.z); 

    updateSceneVisuals(item.visuals);
  });
}

// particles!
const particleCount = 400;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);

// 2. Scatter particles in a large cube around the chair
for (let i = 0; i < particleCount * 3; i++) {
    particlePositions[i] = (Math.random() - 0.5) * 15; 
}

particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));

const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.02,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending // Makes them "glow" against the background
});

const dustParticles = new THREE.Points(particleGeometry, particleMaterial);
myScene.add(dustParticles);

// rotation animation
function animate() {
    requestAnimationFrame(animate);

    // Rotate the whole dust cloud slowly
    dustParticles.rotation.y += 0.0005;
    dustParticles.rotation.x += 0.0002;

    if (currentModel) {
        currentModel.rotation.y += 0.00025;
    }
    controls.update();
    threeRenderer.render(myScene, mainCamera);
    labelRenderer.render(myScene, mainCamera);
}
animate();

window.addEventListener('resize', () => {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    
    mainCamera.aspect = screenWidth / screenHeight;
    mainCamera.updateProjectionMatrix();
    
    threeRenderer.setSize(screenWidth, screenHeight);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});


function openModal(itemIndex) {
    const item = furnitureData[itemIndex];
    if (!item) {
      console.error("No item found at index:", itemIndex);
      return
    };

    document.querySelector('.modelTitle').textContent = item.name;
    document.querySelector('.modelDesc').textContent = item.description;
    
    const specsList = document.querySelector('.modelSpecs');
    specsList.innerHTML = item.specs.map(s => `<li>${s}</li>`).join('');
    
    document.querySelector('.modal').classList.remove('hidden');
};

function changeFurniture(direction) {
  if (direction === 'next') {
    currentIndex = (currentIndex + 1) % furnitureData.length;
  } else {
    currentIndex = (currentIndex - 1 + furnitureData.length) % furnitureData.length;
  }

  const item = furnitureData[currentIndex];

  if (currentModel) {
    disposeModel(currentModel);
    currentModel = null;
  }

  gltfLoader.load(item.path, (gltf) => {
    currentModel = gltf.scene;

    // 1. Center the model
    const box = new THREE.Box3().setFromObject(currentModel);
    const center = box.getCenter(new THREE.Vector3());
    currentModel.position.x += (currentModel.position.x - center.x);
    currentModel.position.z += (currentModel.position.z - center.z);
    currentModel.position.y = -1.75;

    // 2. Prep the GSAP Slide
    const startXOffset = direction === 'next' ? 4 : -4;
    const finalCenteredX = currentModel.position.x; // Save the "centered" zero
    currentModel.position.x += startXOffset; // Move it off-screen to start
    
    currentModel.scale.set(1.2, 1.2, 1.2); 
    myScene.add(currentModel);

    // 3. Attach Hotspot
    currentModel.add(activeHotspot);
    activeHotspot.position.set(item.hotspotPos.x, item.hotspotPos.y, item.hotspotPos.z);

    // 4. Run Animations
    gsap.to(currentModel.position, {
      x: finalCenteredX,
      duration: 1.2,
      ease: "power4.out"
    });

    gsap.to(currentModel.scale, {
      x: 1.5, y: 1.5, z: 1.5,
      duration: 1.0,
      ease: "back.out(1.7)"
    });

    updateSceneVisuals(item.visuals);
    const productTitle = document.querySelector('.productTitle');
    if (productTitle) productTitle.textContent = item.name;
  });
}

// Global Event Listner and interaction handler
function handleInteractions(event){
  const target = event.target.closest(`[data-action]`);

  if(!target) return;

  const action = target.getAttribute('data-action');

  switch (action) {
    case 'next': 
        changeFurniture('next');
        break;
    case 'prev': 
        changeFurniture('prev');
        break;
    case 'open-modal':
        openModal(currentIndex);
        break;
    case 'close-modal':
        document.querySelector('.modal').classList.add('hidden');
        break;
    default:
        console.log("Action not defined:", action);
  }
};

// refresh canvas 
function disposeModel(model) {
    if (!model) return;
    
    model.traverse((node) => {
        if (node.isMesh) {
            node.geometry.dispose();
            if (node.material.isMaterial) {
                cleanMaterial(node.material);
            } else {
                for (const material of node.material) cleanMaterial(material);
            }
        }
    });
    myScene.remove(model);
}

function cleanMaterial(material) {
    material.dispose();
    for (const key of Object.keys(material)) {
        if (material[key] && material[key].isTexture) {
            material[key].dispose();
        }
    }
}


//hotspot function
function createHotspot() {
    const hotspotDiv = document.createElement('div');
    hotspotDiv.className = 'hotspot';
    // No textContent needed, CSS handles the visuals
    hotspotDiv.setAttribute('data-action', 'open-modal');

    const hotspotLabel = new CSS2DObject(hotspotDiv);
    
    // Position: x: 0.8 (right), y: -1.5 (near feet), z: 0.5 (front)
    hotspotLabel.position.set(0.8, -1.5, 0.5);
    hotspotLabel.element.style.zIndex = '1000';
    return hotspotLabel;
}

let activeHotspot = createHotspot();
// 2D event listners
document.body.addEventListener('click', handleInteractions);
initGallery();