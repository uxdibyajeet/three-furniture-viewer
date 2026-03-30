import * as THREE from "three";

// scene
const myScene = new THREE.Scene();
myScene.background = new THREE.Color(0x222222);

// Renderer - canvas
const screenWidth = window.innerWidth; //fetch browser width 
const screeHeight = window.innerHeight; //fetch browser height
const threeRenderer = new THREE.WebGLRenderer({antialias: true});
threeRenderer.setSize(screenWidth, screeHeight); //renderer
document.body.appendChild(threeRenderer.domElement);

// camera element
const fieldOfView = 75;
const aspectRation = screenWidth / screeHeight;
const near = 0.1;
const far = 10;
const mainCamera = new THREE.PerspectiveCamera(fieldOfView, aspectRation, near, far);
mainCamera.position.z = 5;

threeRenderer.render(myScene, mainCamera);