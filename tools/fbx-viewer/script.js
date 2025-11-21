import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/FBXLoader.js';

// Global variables
let scene, camera, renderer, controls, mixer, clock;
let currentModel = null;
let animationId = null;

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const viewerArea = document.getElementById('viewerArea');
const canvas = document.getElementById('renderCanvas');
const resetViewBtn = document.getElementById('resetViewBtn');
const changeModelBtn = document.getElementById('changeModelBtn');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const animationControls = document.getElementById('animationControls');
const modelInfo = document.getElementById('modelInfo');

// Init Three.js Scene
function initScene() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    scene.fog = new THREE.Fog(0x1e293b, 50, 200);

    // Camera
    const container = document.getElementById('canvas-container');
    camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 10, 30);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x6366f1, 0.5);
    pointLight.position.set(-10, 10, -10);
    scene.add(pointLight);

    // Grid
    const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Orbit Controls
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 100;

    // Clock for animations
    clock = new THREE.Clock();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    animationId = requestAnimationFrame(animate);

    if (mixer) {
        mixer.update(clock.getDelta());
    }

    controls.update();
    renderer.render(scene, camera);
}

function loadFBXFile(file) {
    const loadManager = new THREE.LoadingManager();
    const loader = new FBXLoader(loadManager);

    // Show loading info
    modelInfo.innerHTML = '<h4>Loading model...</h4><p>Please wait...</p>';

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            loader.parse(e.target.result, '', (object) => {
                // Remove previous model if exists
                if (currentModel) {
                    scene.remove(currentModel);
                }

                currentModel = object;
                scene.add(object);

                // Center the model
                const box = new THREE.Box3().setFromObject(object);
                const center = box.getCenter(new THREE.Vector3());
                object.position.sub(center);

                // Scale to fit view
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 20 / maxDim;
                object.scale.multiplyScalar(scale);

                // Check for animations
                if (object.animations && object.animations.length > 0) {
                    mixer = new THREE.AnimationMixer(object);
                    const action = mixer.clipAction(object.animations[0]);
                    action.play();
                    animationControls.style.display = 'flex';

                    modelInfo.innerHTML = `
                        <h4>Model Info</h4>
                        <p><strong>Animations:</strong> ${object.animations.length}</p>
                        <p><strong>Vertices:</strong> ${countVertices(object)}</p>
                        <p><strong>Materials:</strong> ${countMaterials(object)}</p>
                    `;
                } else {
                    animationControls.style.display = 'none';

                    modelInfo.innerHTML = `
                        <h4>Model Info</h4>
                        <p><strong>No animations found</strong></p>
                        <p><strong>Vertices:</strong> ${countVertices(object)}</p>
                        <p><strong>Materials:</strong> ${countMaterials(object)}</p>
                    `;
                }

                // Show viewer area
                dropZone.style.display = 'none';
                viewerArea.style.display = 'block';

                // Start animation loop if not started
                if (!animationId) {
                    animate();
                }
            });
        } catch (error) {
            console.error('Error loading FBX:', error);
            modelInfo.innerHTML = `<h4>Error</h4><p>Failed to load FBX file: ${error.message}</p>`;
        }
    };

    reader.readAsArrayBuffer(file);
}

function countVertices(object) {
    let count = 0;
    object.traverse((child) => {
        if (child.isMesh && child.geometry) {
            count += child.geometry.attributes.position.count;
        }
    });
    return count.toLocaleString();
}

function countMaterials(object) {
    const materials = new Set();
    object.traverse((child) => {
        if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(m => materials.add(m.uuid));
            } else {
                materials.add(child.material.uuid);
            }
        }
    });
    return materials.size;
}

// Event Listeners
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.fbx')) {
        loadFBXFile(file);
    } else {
        alert('Please upload a valid FBX file');
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadFBXFile(file);
    }
});

resetViewBtn.addEventListener('click', () => {
    camera.position.set(0, 10, 30);
    controls.reset();
});

changeModelBtn.addEventListener('click', () => {
    viewerArea.style.display = 'none';
    dropZone.style.display = 'block';
    if (mixer) {
        mixer.stopAllAction();
        mixer = null;
    }
    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
    }
    fileInput.value = '';
});

playBtn.addEventListener('click', () => {
    if (mixer) {
        mixer.timeScale = 1;
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-flex';
    }
});

pauseBtn.addEventListener('click', () => {
    if (mixer) {
        mixer.timeScale = 0;
        pauseBtn.style.display = 'none';
        playBtn.style.display = 'inline-flex';
    }
});

// Initialize scene on load
initScene();
