import {TrackballControls} from './TrackBallControls.js';

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
import { board } from "./world.js";
import { cubes } from "./cubes.js";
const objects = [...cubes, board];

objects.forEach((object) => scene.add(object));

// Add mouse controls
const controls = new TrackballControls(camera, renderer.domElement);
controls.addEventListener('start', () => console.log("Controls Change"));
controls.enableZoom = true;
controls.autoRotate = true;
controls.rotateSpeed = 1.0;

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
  
//   // Set up the raytracer for clicking
//   window.addEventListener("mousemove", onMouseMove, false);
//   renderer.raycaster = new THREE.Raycaster();
//   renderer.mouse = new THREE.Vector2();
  
//   // calculate mouse position in normalized device coordinates
//   // (-1 to +1) for both components
//   function onMouseMove( event ) {
//       renderer.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
//       renderer.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
//   }

// Animation
const renderLoop = (timeMs) => {
  const time = timeMs * 0.0001;
  requestAnimationFrame(renderLoop);
  objects.forEach((object, index) => {
    object.update(time);
  });
  controls.update();
  renderer.render(scene, camera);
  
};
// Set callback to begin animation
requestAnimationFrame(renderLoop);
