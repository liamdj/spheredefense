import { handleCollisions } from "./utils.js";
import { TrackballControls } from "./TrackBallControls.js";
import { Fighter } from "./objects/fighter.js";
import { Explosion } from "./objects/particles.js";
import { board } from "./objects/board.js";
import { createPlanet } from "./objects/planet.js";
import { checkNewEnemy } from "./enemy.js";
import { Turret } from "./objects/turret.js";
import { Tower } from "./objects/tower.js";
import { createTriangles } from "./objects/triangles.js"

const container = document.getElementById("viewcontainer");
const [width, height] = [window.innerWidth, window.innerHeight];

const fighter = new Fighter(width / height);
const planet = createPlanet();
const triangles = createTriangles();
const tower = new Tower(board.tiles[0]);
const blobMeshes = [];
const entities = [];
const idToEntity = new Map();
const scene = new THREE.Scene();
const pointer = new THREE.Vector2();
[fighter, planet, board, board.lines, triangles, tower].forEach(addEntity);
const meshPosition = board.mesh.geometry.attributes.position;

let perspectiveCamera,
    controls,
    renderer,
    cameraLight,
    raycaster,
    arrowHelper;

init();
animate();

function init() {
    const aspect = width / height;

    perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
    perspectiveCamera.position.z = 500;

    // world
    scene.background = new THREE.Color(0x1c1c1c);
    scene.fog = new THREE.FogExp2(0x1c1c1c, 0.001);
    // scene.fog = new THREE.FogExp2(0x1c1c1c, 0.001);

    const axesHelper = new THREE.AxesHelper(1000);
    scene.add(axesHelper);

    const cameraHelper = new THREE.CameraHelper(fighter.camera);
    scene.add(cameraHelper);

    arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), fighter.group.position, 0xffff00);
    // scene.add(arrowHelper);

    // objects
    objects.forEach((object) => scene.add(object.mesh));

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
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    fighter.updateVelocity(-3 * pointer.x, 3 * pointer.y + 0.5);
}

function onClick(event) {
    const camera = perspectiveCamera;

    raycaster.setFromCamera(new THREE.Vector2(), fighter.camera);

    const intersects = raycaster.intersectObjects([board.mesh, ...blobMeshes]);

    const intersects = raycaster.intersectObject(board.mesh);

    console.log(idToEntity);

    if (intersects.length > 0) {
        // hit a tile
        const intersect = intersects[0];
        intersectPoint = intersect.point;
        const entity = idToEntity.get(intersect.object.id);

        // remove blob hit
        if (entity.type == "TROOP") {
            entity.health = -1;
            console.log(entity);
        }
    }
    const [leftBullet, rightBullet] = fighter.fireBullets(intersectPoint);
    addEntity(leftBullet);
    addEntity(rightBullet);
}

function clearHighlights() {
    adjLines.forEach((adjLine) => {
        adjLine.tile.available = false;
        scene.remove(adjLine.highlight);
    });
    adjLines = [];
}

function animate(timeMs) {
    const time = timeMs * 0.0001;
    requestAnimationFrame(animate);

    // fighter.updateVelocity(-2, 0);
    entities.forEach((e) => {
        e.timeStep(time);
    });
    // arrowHelper.position.copy(fighter.group.localToWorld(fighter.group.position.clone()));
    // arrowHelper.setDirection(vel.normalize());
    // cameraLight.position.copy(fighter.group.localToWorld(fighter.group.position.clone()));
    // // game logic
    if (!stats.gameover) {
        const newTroop = checkNewEnemy(time, board.tiles);
        if (newTroop) {
            addEntity(newTroop);
            blobMeshes.push(newTroop.mesh);
        }
        handleCollisions(entities, scene, score, time, blobMeshes);
    }

    controls.update();

    render();
}

function addEntity(entity) {
    idToEntity.set(entity.mesh.id, entity);
    entities.push(entity);
    scene.add(entity.mesh);
}

function render() {
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
}
