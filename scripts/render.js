import { handleCollisions } from "./utils.js";
import { Fighter } from "./objects/fighter.js";
import { Explosion } from "./objects/particles.js";
import { createPlanet } from "./objects/planet.js";
import { checkNewEnemy } from "./enemy.js";
import { Turret } from "./objects/turret.js";
import { triangles } from "./objects/triangles.js";
import { TrackballControls } from "./lib/TrackBallControls.js";
import { board } from "./objects/board.js";
import { HoverLines, SelectFace } from "./objects/selection.js";
import { Tower } from "./objects/tower.js";
import { handleEnemyBehavior } from "./enemy.js";

const meshPosition = board.mesh.geometry.attributes.position;

let perspectiveCamera,
  controls,
  scene,
  renderer,
  cameraLight,
  raycaster,
  selectedTile,
  pointer,
  turretCount,
  arrowHelper;

turretCount = 0;

const container = document.getElementById("viewcontainer");
const [width, height] = [window.innerWidth, window.innerHeight];
let adjLines = [];

const fighterPos = new THREE.Vector3(0, 0, 0);
fighterPos.addScaledVector(board.tiles[0].centroid, 1.3);

const fighter = new Fighter(width / height, fighterPos);
const tower = new Tower(board.tiles[0]);
const blobMeshes = [];
const entities = [];
const idToEntity = new Map();
const selectLines = new HoverLines();
const selectFace = new SelectFace();
scene = new THREE.Scene();
pointer = new THREE.Vector2();

init();
animate();

function init() {
  const aspect = width / height;

  perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
  perspectiveCamera.position.addScaledVector(board.tiles[0].centroid, 1.5);

  // world
  scene.background = new THREE.Color(0x1c1c1c);
  scene.fog = new THREE.FogExp2(0x1c1c1c, 0.001);
  // scene.fog = new THREE.FogExp2(0x1c1c1c, 0.001);

  const axesHelper = new THREE.AxesHelper(1000);
  scene.add(axesHelper);

  const cameraHelper = new THREE.CameraHelper(fighter.camera);
  scene.add(cameraHelper);

  arrowHelper = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    fighter.group.position,
    0xffff00
  );
  scene.add(arrowHelper);

  [
    fighter,
    triangles,
    board,
    board.lines,
    selectLines,
    selectFace,
    tower,
  ].forEach(addEntity);

  // lights
  cameraLight = new THREE.DirectionalLight(0xffffff, 0.8);
  cameraLight.position.copy(perspectiveCamera.position);
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
  window.addEventListener("keydown", onKeyDown);

  createControls(perspectiveCamera);

  raycaster = new THREE.Raycaster();
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
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  if (stats.phase === "flight")
    fighter.updateVelocity(-3 * pointer.x, 3 * pointer.y + 0.5);
}

function onClick(event) {
  if (stats.phase == "flight") {
    raycaster.setFromCamera(new THREE.Vector2(), fighter.camera);

    const intersects = raycaster.intersectObjects([board.mesh, ...blobMeshes]);
    let intersectPoint;

    if (intersects.length > 0) {
      // hit a tile
      const intersect = intersects[0];
      intersectPoint = intersect.point;
      const entity = idToEntity.get(intersect.object.id);

      // remove blob hit
      if (entity.type == "TROOP") {
        entity.health = -1;
      }
    }
    const [leftBullet, rightBullet] = fighter.fireBullets(intersectPoint);
    addEntity(leftBullet);
    addEntity(rightBullet);
  } else {
    const camera = perspectiveCamera;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObject(board.mesh);

    if (intersects.length > 0) {
      // hit a tile
      const intersect = intersects[0];
      const tile = board.tiles[board.faceToTile[intersect.faceIndex]];

      if (selectedTile == board.faceToTile[intersect.faceIndex]) {
        // already highlighted

        if (tile.turret) {
          // clicked again on existing turret
          // scene.remove(tile.turret);
          // tile.turret = undefined;
          // turretCount -= 1;
        } else {
          // clicked again on empty space
          if (turretCount < settings.MAX_TURRETS) {
            const newTurret = new Turret(tile, intersect.face.normal);
            tile.turret = newTurret;
            addEntity(newTurret);
            turretCount += 1;
          }
        }
        selectedTile = undefined;
        selectFace.mesh.visible = false;
        clearHighlights();
      } else {
        const prevTile = selectedTile;
        selectedTile = board.faceToTile[intersect.faceIndex];

        // draw the selected tile highlight
        const linePosition = selectFace.mesh.geometry.attributes.position;

        linePosition.array[0] = tile.a.x;

        linePosition.copyAt(0, meshPosition, tile.a);
        linePosition.copyAt(1, meshPosition, tile.b);
        linePosition.copyAt(2, meshPosition, tile.c);
        linePosition.copyAt(3, meshPosition, tile.a);

        if (tile.turret && !tile.turret.moving) {
          // show adjacent tiles
          tile.adjacents.forEach((adjTile, adjInd) => {
            if (adjTile.turret === undefined) {
              adjTile.available = true;
              const v1 = new THREE.Vector3(
                meshPosition.getX(adjTile.a),
                meshPosition.getY(adjTile.a),
                meshPosition.getZ(adjTile.a)
              );
              const v2 = new THREE.Vector3(
                meshPosition.getX(adjTile.b),
                meshPosition.getY(adjTile.b),
                meshPosition.getZ(adjTile.b)
              );
              const v3 = new THREE.Vector3(
                meshPosition.getX(adjTile.c),
                meshPosition.getY(adjTile.c),
                meshPosition.getZ(adjTile.c)
              );
              const newGeometry = new THREE.BufferGeometry();
              const vertices = new Float32Array([
                v1.x,
                v1.y,
                v1.z,
                v2.x,
                v2.y,
                v2.z,
                v3.x,
                v3.y,
                v3.z,
              ]);
              newGeometry.setAttribute(
                "position",
                new THREE.BufferAttribute(vertices, 3)
              );
              const adjLine = new THREE.Mesh(
                newGeometry,
                new THREE.MeshBasicMaterial({ color: 0xfcec03 })
              );
              scene.add(adjLine);
              adjLines.push({ highlight: adjLine, tile: adjTile });
            }
          });
        } else {
          if (tile.available) {
            board.tiles[prevTile].turret.moveFromTo(
              board.tiles[prevTile],
              tile
            );
            clearHighlights();
          } else {
            clearHighlights();
          }
        }
        board.mesh.updateMatrix();
        selectFace.mesh.geometry.applyMatrix4(board.mesh.matrix);
        selectFace.mesh.visible = true;
      }
    } else {
      selectFace.mesh.visible = false;
      clearHighlights();
    }
  }
}

function onKeyDown(event) {
  if (stats.phase === "flight") {
    if (event.code === "Space") {
      if (fighter.moving) {
        fighter.pause();
      } else {
        fighter.resume();
      }
    }
  }
}

function clearHighlights() {
  adjLines.forEach((adjLine) => {
    adjLine.tile.available = false;
    scene.remove(adjLine.highlight);
  });
  adjLines = [];
}

function animate(timeMs) {
  if (stats.gameover) return;
  const time = timeMs * 0.0001;
  requestAnimationFrame(animate);

  if (stats.phase === "build") {
    cameraLight.position.copy(perspectiveCamera.position);
    // console.log(fighter.group.localToWorld(fighter.group.position.clone()));
  }
  entities.forEach((obj) => {
    obj.timeStep(time);
  });

  // arrowHelper.position.copy(fighter.group.localToWorld(fighter.group.position.clone()));
  // arrowHelper.setDirection(vel.normalize());
  // cameraLight.position.copy(fighter.group.localToWorld(fighter.group.position.clone()));

  // game logic
  if (stats.phase === "build") {
    fighter.pause();
  }
  const newTroop = checkNewEnemy(time, board.tiles);
  if (newTroop) {
    addEntity(newTroop);
    blobMeshes.push(newTroop.mesh);
  }
  handleCollisions(entities, scene, score, time, blobMeshes);
  document.getElementById("turrets-remaining").innerHTML =
    settings.MAX_TURRETS - turretCount;

  controls.update();

  render();
}

function addEntity(entity) {
  idToEntity.set(entity.mesh.id, entity);
  entities.push(entity);
  scene.add(entity.mesh);
}

function render() {
  if (stats.phase == "build") {
    const camera = perspectiveCamera;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObject(board.mesh);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const tile = board.tiles[board.faceToTile[intersect.faceIndex]];
      const linePosition = selectLines.mesh.geometry.attributes.position;

      linePosition.copyAt(0, meshPosition, tile.a);
      linePosition.copyAt(1, meshPosition, tile.b);
      linePosition.copyAt(2, meshPosition, tile.c);
      linePosition.copyAt(3, meshPosition, tile.a);

      board.mesh.updateMatrix();

      selectLines.mesh.geometry.applyMatrix4(board.mesh.matrix);

      selectLines.mesh.visible = true;
    } else {
      selectLines.mesh.visible = false;
    }

    renderer.render(scene, camera);
  } else {
    fighter.camera.getWorldPosition(new THREE.Vector3()); // weird bug fix
    fighter.camera.updateProjectionMatrix();
    renderer.render(scene, fighter.camera);
  }
}
