import { handleCollisions } from "./utils.js";
import { Fighter } from "./objects/fighter.js";
import { checkNewEnemy } from "./enemy.js";
import { Turret } from "./objects/turret.js";
import { Explosion } from "./objects/particles.js";
import { Star } from "./objects/stars.js";
import { TrackballControls } from "./lib/TrackBallControls.js";
import { HoverLines, SelectFace } from "./objects/selection.js";
import { Tower } from "./objects/tower.js";
import { Troop } from "./objects/troops.js";
import { handleEnemyBehavior } from "./enemy.js";
import {
  loadWorld,
  menuScreen,
  appendGUI,
  displaySettings,
  setVars,
  board,
} from "./loading.js";

let perspectiveCamera,
  controls,
  scene,
  renderer,
  cameraLight,
  raycaster,
  selectedTile,
  pointer,
  turretCount,
  fighter,
  tower,
  blobSpheres,
  entities,
  idToBlobs,
  selectLines,
  selectFace,
  audioListener,
  meshPosition,
  lastTime = 0;

turretCount = 0;

const container = document.getElementById("viewcontainer");
const [width, height] = [window.innerWidth, window.innerHeight];
let adjLines = [];

// load a bunch of assets
const loader = new THREE.GLTFLoader();
const mtlloader = new THREE.MTLLoader();
const objLoader = new THREE.OBJLoader();
const audioLoader = new THREE.AudioLoader();
audioListener = new THREE.AudioListener();

reload = () => {
  menuScreen();
  appendGUI();
  $(".dg").remove();
};
showSettings = displaySettings;
startGame = () => {
  container.innerHTML = "";
  appendGUI();
  meshPosition = board.mesh.geometry.attributes.position;
  fighter = new Fighter(width / height);
  tower = new Tower(board.tiles[0]);
  blobSpheres = [];
  entities = [];
  idToBlobs = new Map();
  selectLines = new HoverLines();
  selectFace = new SelectFace();
  scene = new THREE.Scene();
  pointer = new THREE.Vector2();

  init();
  animate();
};

setVars(
  container,
  loader,
  audioLoader,
  audioListener,
  startGame,
  mtlloader,
  objLoader
);
loadWorld();

function init() {
  const aspect = width / height;

  perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 1, 1000000);
  perspectiveCamera.position.addScaledVector(board.tiles[0].centroid, 2);
  perspectiveCamera.add(audioListener);

  // world
  scene.background = new THREE.Color(0x1c1c1c);
  scene.fog = new THREE.FogExp2(0x1c1c1c, 0.00001);

  const stars = {};
  const starArr = [];
  const mesh = new THREE.Group();
  for (let i = 0; i < 1000; i++) {
    const star = new Star();
    starArr.push(star);
    mesh.add(star.mesh);
  }
  stars.mesh = mesh;
  stars.timeStep = (time) => {
    starArr.forEach((child) => child.timeStep(time));
  };

  [fighter, stars, board, selectLines, selectFace, tower].forEach(addEntity);

  // lights
  cameraLight = new THREE.DirectionalLight(0xffffff, 1.5);
  cameraLight.position.copy(perspectiveCamera.position);
  cameraLight.target.position.set(0, 0, 0);
  scene.add(cameraLight);

  const ambientLight = new THREE.AmbientLight(0x555555);
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
  window.addEventListener("touchend", onClick);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  document.getElementById("lives").innerHTML = stats.lives;
  document.getElementById("score").innerHTML = 0;
  document.getElementById("turrets-remaining").innerHTML = settings.MAX_TURRETS;

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
    (event.clientX / width) * 2 - 1,
    -(event.clientY / height) * 2 + 1
  );
  if (stats.phase === "flight") {
    const distSqFromCenter =
      (event.clientX - width / 2) ** 2 + (event.clientY - height / 2) ** 2;
    const radius = 0.2 * Math.min(width, height);
    const distSqFromCirc = distSqFromCenter - radius ** 2;
    if (distSqFromCirc <= 0) {
      const vector = new THREE.Vector3(pointer.x, pointer.y, -1);
      vector.unproject(fighter.camera);
      fighter.group.worldToLocal(vector);
      fighter.crosshairs.setTo(vector.multiplyScalar(2.5));

      fighter.updateVelocity(new THREE.Vector2(0, 0));
    } else {
      fighter.crosshairs.sprite.visible = false;
      const scalar = Math.sqrt(
        distSqFromCirc /
        ((width / 2 - radius) ** 2 + (height / 2 - radius) ** 2)
      );
      fighter.updateVelocity(
        pointer.clone().normalize().multiplyScalar(scalar)
      );
    }
  }
}

function onClick(event) {
  if (
    stats.phase === "flight" &&
    fighter.angularVel.x == 0 &&
    fighter.angularVel.y == 0 &&
    fighter.timeLastFired + Fighter.timeBetweenShots < lastTime
  ) {
    Fighter.shootSound.play();
    raycaster.setFromCamera(pointer, fighter.camera);

    const intersects = raycaster.intersectObjects([board.mesh, ...blobSpheres]);

    for (let inter of intersects) {
      const entity = idToBlobs.get(inter.object.id);

      // remove blob hit
      if (entity) {
        entity.health -= Fighter.damage;
        const explosion = new Explosion(
          inter.point,
          inter.point.clone().normalize(),
          lastTime,
          false
        );
        addEntity(explosion);
      } else {
        break;
      }
    }

    if (intersects.length > 0) {
      const [leftBullet, rightBullet] = fighter.fireBulletsAt(
        intersects[0].point,
        lastTime
      );
      addEntity(leftBullet);
      addEntity(rightBullet);
    } else {
      const vector = new THREE.Vector3(pointer.x, pointer.y, -1);
      vector.unproject(fighter.camera);
      fighter.group.worldToLocal(vector);
      const [leftBullet, rightBullet] = fighter.fireBulletsDirection(
        vector,
        lastTime
      );
      addEntity(leftBullet);
      addEntity(rightBullet);
    }
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
      fighter.breaking = true;
    }
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
      stats.phase = "build";
    }
  } else {
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
      stats.phase = "flight";
    }
  }
}

function onKeyUp(event) {
  if (stats.phase === "flight") {
    if (event.code === "Space") {
      fighter.breaking = false;
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
  lastTime = time;
  requestAnimationFrame(animate);

  if (stats.phase === "build") {
    cameraLight.position.copy(perspectiveCamera.position);
    selectLines.mesh.visible = true;
    selectFace.mesh.visible = true;
  } else if (stats.phase === "flight") {
    cameraLight.position.copy(
      fighter.group.localToWorld(fighter.group.position.clone())
    );
    selectLines.mesh.visible = false;
    selectFace.mesh.visible = false;
  }
  entities.forEach((obj) => {
    // skip the fighter if in build mode
    if (stats.phase !== "flight" && obj == fighter) return;
    obj.timeStep(time);
  });

  // game logic
  if (stats.phase === "build") {
    fighter.crosshairs.sprite.visible = false;
  }
  const newTroop = checkNewEnemy(time, board.tiles);
  if (newTroop) {
    addEntity(newTroop);
    blobSpheres.push(newTroop.sphere);
    idToBlobs.set(newTroop.sphere.id, newTroop);
  }
  handleCollisions(entities, scene, time, blobSpheres, idToBlobs);
  if ($("#turrets-remaining").length)
    $("#turrets-remaining").html(settings.MAX_TURRETS - turretCount);

  controls.update();

  render();
}

function addEntity(entity) {
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
