import { TrackballControls } from "./TrackBallControls.js";
import { triangles } from "./objects/triangles.js";
import { board, tileLines, tiles, faceToTile } from "./objects/board.js";
import { selectionLines } from "./objects/selection.js";
import { tower } from "./objects/tower.js";
import { troops } from "./objects/troops.js";

const selectLines = selectionLines[0];
const selectFace = selectionLines[1];
const objects = [
  ...triangles,
  board,
  tileLines,
  ...troops,
  ...tower,
  ...selectionLines,
];

let perspectiveCamera,
  controls,
  scene,
  renderer,
  cameraLight,
  raycaster,
  pointer;

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
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("click", onClick);

  createControls(perspectiveCamera);

  raycaster = new THREE.Raycaster();

  pointer = new THREE.Vector2();
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
function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onClick(event) {
  const camera = perspectiveCamera;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObject(board);

  if (intersects.length > 0) {
    const intersect = intersects[0];
    const tile = tiles[faceToTile[intersect.faceIndex]];

    const linePosition = selectFace.geometry.attributes.position;
    const meshPosition = board.geometry.attributes.position;

    linePosition.copyAt(0, meshPosition, tile.a);
    linePosition.copyAt(1, meshPosition, tile.b);
    linePosition.copyAt(2, meshPosition, tile.c);
    linePosition.copyAt(3, meshPosition, tile.a);

    board.updateMatrix();

    selectFace.geometry.applyMatrix4(board.matrix);

    selectFace.visible = true;
  } else {
    selectFace.visible = false;
  }
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

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObject(board);

  if (intersects.length > 0) {
    const intersect = intersects[0];
    const tile = tiles[faceToTile[intersect.faceIndex]];
    const linePosition = selectLines.geometry.attributes.position;
    const meshPosition = board.geometry.attributes.position;

    linePosition.copyAt(0, meshPosition, tile.a);
    linePosition.copyAt(1, meshPosition, tile.b);
    linePosition.copyAt(2, meshPosition, tile.c);
    linePosition.copyAt(3, meshPosition, tile.a);

    board.updateMatrix();

    selectLines.geometry.applyMatrix4(board.matrix);

    selectLines.visible = true;
  } else {
    selectLines.visible = false;
  }

  renderer.render(scene, camera);
}
