import { handleCollisions } from "./utils.js";
import { TrackballControls } from "./TrackBallControls.js";
import { Fighter } from "./objects/fighter.js";
import { board, tileLines, tiles, faceToTile } from "./objects/board.js";
import { selectionLines } from "./objects/selection.js";
import { createPlanet } from "./objects/planet.js";
import { handleEnemyBehavior } from "./enemy.js";
import { turret } from "./objects/turret.js";
import { createTriangles } from "./objects/triangles.js"

const container = document.getElementById("viewcontainer");
const [width, height] = [window.innerWidth, window.innerHeight];

const fighter = new Fighter(width / height);
const planet = createPlanet();
const triangles = createTriangles();
let entities = [fighter, planet, triangles];

let perspectiveCamera,
    controls,
    scene,
    renderer,
    cameraLight,
    raycaster,
    selectedTile,
    pointer,
    arrowHelper;

let adjLines = [];
let blobs = new THREE.Group();

init();
animate();

function init() {
    const aspect = width / height;


    perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
    perspectiveCamera.position.z = 500;

    // world
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1c1c1c);
    // scene.fog = new THREE.FogExp2(0x1c1c1c, 0.001);

    const axesHelper = new THREE.AxesHelper(1000);
    scene.add(axesHelper);

    const cameraHelper = new THREE.CameraHelper(fighter.camera);
    scene.add(cameraHelper);

    arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), fighter.group.position, 0xffff00);
    // scene.add(arrowHelper);

    // objects
    entities.forEach((e) => scene.add(e.mesh));

    // lights
    cameraLight = new THREE.DirectionalLight(0xffffff, 0.8);
    cameraLight.target.position.set(0, 0, 0);
    scene.add(cameraLight);

    const ambientLight = new THREE.AmbientLight(0x666666);
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

    fighter.camera.aspect = aspect;
    fighter.camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);


    controls.handleResize();
}
function onPointerMove(event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    fighter.updateVelocity(-3 * x, 3 * y + 0.5);
}

function onClick(event) {

    raycaster.setFromCamera(pointer, fighter.camera);

    const intersects = raycaster.intersectObject(blobs);

    let intersectPoint;

    if (intersects.length > 0) {
        // hit something
        const intersect = intersects[0];
        intersectPoint = intersect.point;

        // remove blob hit
        blobs.remove(intersect.object);
    }
    const [leftBullet, rightBullet] = fighter.fireBullets(intersectPoint);
    entities.push(leftBullet);
    entities.push(rightBullet);
    scene.add(leftBullet.mesh, rightBullet.mesh);
}

// function clearHighlights() {
//     adjLines.forEach((adjLine) => {
//         adjLine.tile.available = false;
//         scene.remove(adjLine.highlight);
//     });
//     adjLines = [];
// }

function animate(timeMs) {
    // if (timeMs > 2000) return;
    const time = timeMs * 0.0001;
    requestAnimationFrame(animate);

    // fighter.updateVelocity(-2, 0);
    entities = entities.filter((e) => {
        e.timeStep(time);
        if (e.isGone)
            scene.remove(e.mesh);
        return !e.isGone;
    });
    // arrowHelper.position.copy(fighter.group.localToWorld(fighter.group.position.clone()));
    // arrowHelper.setDirection(vel.normalize());
    // cameraLight.position.copy(fighter.group.localToWorld(fighter.group.position.clone()));
    // // game logic
    // if (!stats.gameover) {
    //     handleEnemyBehavior(timeMs, tiles, scene, objects);
    //     handleCollisions(objects, scene, score);
    // }

    controls.update();

    render();
}

function render() {
    // const camera = perspectiveCamera;

    // raycaster.setFromCamera(pointer, camera);

    // const intersects = raycaster.intersectObject(board);

    // if (intersects.length > 0) {
    //     const intersect = intersects[0];
    //     const tile = tiles[faceToTile[intersect.faceIndex]];
    //     const linePosition = selectLines.geometry.attributes.position;

    //     linePosition.copyAt(0, meshPosition, tile.a);
    //     linePosition.copyAt(1, meshPosition, tile.b);
    //     linePosition.copyAt(2, meshPosition, tile.c);
    //     linePosition.copyAt(3, meshPosition, tile.a);

    //     board.updateMatrix();

    //     selectLines.geometry.applyMatrix4(board.matrix);

    //     selectLines.visible = true;
    // } else {
    //     selectLines.visible = false;
    // }

    fighter.camera.updateProjectionMatrix();
    renderer.render(scene, fighter.camera);
}
