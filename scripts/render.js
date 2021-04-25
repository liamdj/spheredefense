import { TrackballControls } from "./TrackBallControls.js";
import { triangles } from "./objects/triangles.js";
import { board } from "./objects/board.js";
import { towers } from "./objects/towers.js";

const objects = [...towers, ...triangles, board];

let perspectiveCamera, controls, scene, renderer, cameraLight;

const container = document.getElementById("viewcontainer");
const [width, height] = [container.clientWidth, container.clientHeight];

init();
animate();

function init() {
  const aspect = width / height;

  perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
  perspectiveCamera.position.z = 500;

  // world
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1c1c1c);
  scene.fog = new THREE.FogExp2(0x1c1c1c, 0.001);

  // objects
  objects.forEach((object) => scene.add(object));

  // lights
  cameraLight = new THREE.DirectionalLight(0xffffff, 0.8);
  cameraLight.position.set(
    perspectiveCamera.position.x,
    perspectiveCamera.position.y,
    perspectiveCamera.position.z
  );
  cameraLight.target.position.set(0, 0, 0);
  scene.add(cameraLight);

  const ambientLight = new THREE.AmbientLight(0x222222);
  scene.add(ambientLight);

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  //

  window.addEventListener("resize", onWindowResize);

  createControls(perspectiveCamera);
}

function createControls(camera) {
  controls = new TrackballControls(camera, renderer.domElement);

  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  controls.keys = ["KeyA", "KeyS", "KeyD"];
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;

  perspectiveCamera.aspect = aspect;
  perspectiveCamera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  controls.handleResize();
}

function animate(timeMs) {
  const time = timeMs * 0.0001;
  requestAnimationFrame(animate);

  objects.forEach((object) => object.timeStep(time));
  cameraLight.position.set(
    perspectiveCamera.position.x,
    perspectiveCamera.position.y,
    perspectiveCamera.position.z
  );

  controls.update();

  render();
}

function render() {
  const camera = perspectiveCamera;

  renderer.render(scene, camera);
}
