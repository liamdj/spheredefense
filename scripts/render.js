const scene = new THREE.Scene();

// Init camera (fov, aspect ratio, near, far)
const container = document.getElementById("viewcontainer");
const [width, height] = [container.clientWidth, container.clientHeight];

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

// Init renderer; attach to HTML canvas
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

// Many lighting solutions in ThreeJS
// point lights, directional lights, etc.
const light = new THREE.HemisphereLight(
  0xffffbb, // sky color
  0x080820, // ground color
  1 // intensity
);
scene.add(light);

// all objects must have a function 'obj.update = (time) => <do something>;
import { cubes } from "./cubes.js";
const objects = [...cubes];

objects.forEach((object) => scene.add(object));

// Animation
const renderLoop = (timeMs) => {
  const time = timeMs * 0.0001;
  requestAnimationFrame(renderLoop);
  objects.forEach((object, index) => {
    object.update(time);
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
window.addEventListener("resize", resizeHandler, false);
