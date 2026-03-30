import * as THREE from "three";

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
mainCamera.position.z = 5;

// placeholder model
const geo = new THREE.BoxGeometry(2, 2, 2);
const mat = new THREE.MeshStandardMaterial ({color: 0x00ff00});
const cube = new THREE.Mesh(geo, mat);
myScene.add(cube);

// lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
myScene.add(light);
  //ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  myScene.add(ambient);

// looping rotation animation
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.y += 0.0025;
  threeRenderer.render(myScene, mainCamera); // this appends the canvas into the screen
}
animate();


// reactive canvas size
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