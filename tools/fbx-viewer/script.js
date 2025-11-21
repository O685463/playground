import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import * as fflate from 'https://cdn.jsdelivr.net/npm/fflate@0.8.1/esm/browser.js';
// Make fflate available globally for FBXLoader
window.fflate = fflate;

// Global variables
let scene, camera, renderer, controls, mixer, clock;
let currentModel = null;
let animationId = null;

// DOM elements (will be set after DOMContentLoaded)
let dropZone, fileInput, viewerArea, resetViewBtn, changeModelBtn;
let playBtn, pauseBtn, animationControls, modelInfo;

/** Helper: handle a loaded FBX object **/
function handleLoadedObject(object) {
    // Remove previous model
    if (currentModel) scene.remove(currentModel);
    currentModel = object;
    scene.add(object);

    // Compute bounding box and center model
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);

    // Scale to fit view
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim === 0 ? 1 : 20 / maxDim;
    object.scale.multiplyScalar(scale);

    // Adjust camera to frame the model (slightly closer)
    const radius = size.length() * scale;
    const camDist = radius * 1.8; // closer than before
    const direction = new THREE.Vector3(0, 0, 1); // view from +Z
    camera.position.copy(direction.multiplyScalar(camDist));
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    controls.target.set(0, 0, 0);
    controls.update();

    // Animation handling
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

    // Show viewer UI
    dropZone.style.display = 'none';
    viewerArea.style.display = 'block';

    // Start animation loop if not running
    if (!animationId) animate();
    console.log('Model loaded and displayed');
}

/** Load FBX from a File object **/
function loadFBXFile(file) {
    console.log('Loading FBX file:', file.name);
    modelInfo.innerHTML = '<h4>Loading model...</h4><p>Please wait...</p>';
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const loader = new FBXLoader();
            const object = loader.parse(e.target.result, '');
            console.log('FBX parsed');
            handleLoadedObject(object);
        } catch (err) {
            console.error('Error parsing FBX:', err);
            modelInfo.innerHTML = `<h4>Error</h4><p>Failed to parse FBX: ${err.message}</p>`;
        }
    };
    reader.onerror = e => {
        console.error('FileReader error:', e);
        modelInfo.innerHTML = `<h4>Error</h4><p>Could not read file</p>`;
    };
    reader.readAsArrayBuffer(file);
}

/** Load debug FBX from Resources folder on startup **/
function loadDebugFBX() {
    const url = 'Resources/debug.fbx';
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error('Debug FBX not found');
            return res.arrayBuffer();
        })
        .then(buf => {
            console.log('Debug FBX fetched, size:', buf.byteLength);
            const loader = new FBXLoader();
            const object = loader.parse(buf, '');
            handleLoadedObject(object);
        })
        .catch(err => console.warn('Skipping debug FBX:', err));
}

function countVertices(object) {
    let count = 0;
    object.traverse(child => {
        if (child.isMesh && child.geometry && child.geometry.attributes.position) {
            count += child.geometry.attributes.position.count;
        }
    });
    return count.toLocaleString();
}

function countMaterials(object) {
    const set = new Set();
    object.traverse(child => {
        if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(m => set.add(m.uuid));
            } else {
                set.add(child.material.uuid);
            }
        }
    });
    return set.size;
}

function initScene() {
    console.log('Initializing scene');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    scene.fog = new THREE.Fog(0x1e293b, 50, 200);

    const container = document.getElementById('canvas-container');
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 10, 30);

    const canvas = document.getElementById('renderCanvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lights (brighter)
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(10, 20, 10);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    scene.add(dir);
    const point = new THREE.PointLight(0x6366f1, 0.7);
    point.position.set(-10, 10, -10);
    scene.add(point);

    const grid = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
    scene.add(grid);

    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 100;

    clock = new THREE.Clock();
    window.addEventListener('resize', onWindowResize);
    console.log('Scene initialized');
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    animationId = requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta());
    controls.update();
    renderer.render(scene, camera);
}

// DOMContentLoaded – set up UI and start
document.addEventListener('DOMContentLoaded', () => {
    // Grab DOM elements
    dropZone = document.getElementById('dropZone');
    fileInput = document.getElementById('fileInput');
    viewerArea = document.getElementById('viewerArea');
    resetViewBtn = document.getElementById('resetViewBtn');
    changeModelBtn = document.getElementById('changeModelBtn');
    playBtn = document.getElementById('playBtn');
    pauseBtn = document.getElementById('pauseBtn');
    animationControls = document.getElementById('animationControls');
    modelInfo = document.getElementById('modelInfo');

    initScene();

    // UI event listeners
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.name.toLowerCase().endsWith('.fbx')) loadFBXFile(file);
        else alert('Please upload a valid FBX file');
    });
    fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) loadFBXFile(file);
    });
    resetViewBtn.addEventListener('click', () => { camera.position.set(0, 10, 30); controls.reset(); });
    changeModelBtn.addEventListener('click', () => {
        viewerArea.style.display = 'none';
        dropZone.style.display = 'block';
        if (mixer) { mixer.stopAllAction(); mixer = null; }
        if (currentModel) { scene.remove(currentModel); currentModel = null; }
        fileInput.value = '';
    });
    playBtn.addEventListener('click', () => { if (mixer) { mixer.timeScale = 1; playBtn.style.display = 'none'; pauseBtn.style.display = 'inline-flex'; } });
    pauseBtn.addEventListener('click', () => { if (mixer) { mixer.timeScale = 0; pauseBtn.style.display = 'none'; playBtn.style.display = 'inline-flex'; } });

    console.log('FBX Viewer ready');
    loadDebugFBX();
});
