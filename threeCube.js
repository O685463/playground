
const threeCube = (container) => {
    let scene, camera, renderer, cube;
    let animationFrameId;

    function init() {
        // Scene
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Cube
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Animation
        animate();

        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);
    }

    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function cleanup() {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', onWindowResize);
        if (renderer.domElement.parentElement) {
            renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
        renderer.dispose();
        scene = null;
        camera = null;
        renderer = null;
    }

    init();

    return {
        destroy: cleanup
    };
};
