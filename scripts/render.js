// Find the latest version by visiting https://cdn.skypack.dev/three.
import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.128.0-FqqdQBPsDVJuf7F4I6W0/mode=imports/optimized/three.js';
const scene = new THREE.Scene();

// Init camera (fov, aspect ratio, near, far)
const [width, height] = [window.innerWidth, window.innerHeight];

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

// Init renderer; attach to HTML canvas
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

// Many lighting solutions in ThreeJS
// point lights, directional lights, etc.
const light = new THREE.HemisphereLight(
    0xffffbb, // sky color
    0x080820, // ground color
    1 // intensity
);
scene.add(light);

// width, height, depth
const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
const redMat = new THREE.MeshPhongMaterial({ color: 0xdd2244 });
const c1 = new THREE.Mesh(cubeGeo, redMat);
c1.position.set(-2, 0, -5);
scene.add(c1);
const c2 = new THREE.Mesh(cubeGeo, redMat);
c2.position.set(+2, 0, -5);
scene.add(c2);
const cubes = [c1, c2];

// Animation Attempt #4 Adaption
const renderLoop = (timeMs) => {
    const time = timeMs * 0.0001;
    requestAnimationFrame(renderLoop);
    cubes.forEach((cube, index) => {
        const speed = 1 + index * 0.1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
    });
    renderer.render(scene, camera);
};
// Set callback to begin animation
requestAnimationFrame(renderLoop);

// Window resize event handler
const resizeHandler = () => {
    // Grab new width and heights
    const [width, height] = [window.innerWidth, window.innerHeight];
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
};

// Add to resize event listener
window.addEventListener('resize', resizeHandler, false);
