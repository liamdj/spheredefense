import { Fighter } from "./objects/fighter.js";
import { Turret } from "./objects/turret.js";
import { Star } from "./objects/stars.js";
import { Board } from "./objects/board.js";
import { Tower } from "./objects/tower.js";
import { Troop } from "./objects/troops.js";

let container,
  loader,
  audioLoader,
  audioListener,
  callback,
  mtlloader,
  objLoader;

export let board;

export const setVars = (
  ocontainer,
  oloader,
  oaudioLoader,
  oaudioListener,
  ocallback,
  omtlloader,
  oobjLoader
) => {
  [
    container,
    loader,
    audioLoader,
    audioListener,
    callback,
    mtlloader,
    objLoader,
  ] = [
    ocontainer,
    oloader,
    oaudioLoader,
    oaudioListener,
    ocallback,
    omtlloader,
    oobjLoader,
  ];
};

export const loadWorld = () => {
  container.innerHTML = "Loading world...";
  mtlloader.load(
    // resource URL
    `${siteurl}/models/Mars_1239.mtl`,
    // called when resource is loaded
    function (material) {
      objLoader.setMaterials(material);
      objLoader.load(
        // resource URL
        `${siteurl}/models/Mars_1239.obj`,
        // called when resource is loaded
        function (model) {
          const object = model;
          object.scale.multiplyScalar(0.03 * settings.WORLD_RADIUS);
          Board.planetModel = object;
          board = new Board();
          loadStar();
        },
        // called when loading is in progresses
        function (xhr) {},
        // called when loading has errors
        function (error) {
          console.log("An error occured while loading world");
        }
      );
    },
    // called when loading is in progresses
    function (xhr) {},
    // called when loading has errors
    function (error) {
      console.log("An error occured while loading world");
    }
  );
};
const loadStar = () => {
  container.innerHTML = "Loading stars...";
  loader.load(
    // resource URL
    `${siteurl}/models/star.glb`,
    // called when resource is loaded
    function (model) {
      const object = model.scene;
      object.scale.multiplyScalar(100);
      Star.starModel = object;
      loadPlane();
    },
    // called when loading is in progresses
    function (xhr) {},
    // called when loading has errors
    function (error) {
      console.log("An error occured while loading stars");
    }
  );
};
const loadPlane = () => {
  container.innerHTML = "Loading plane...";
  loader.load(
    // resource URL
    `${siteurl}/models/spaceship.glb`,
    // called when resource is loaded
    function (model) {
      const object = model.scene;
      object.scale.multiplyScalar(100);
      object.rotateY(-Math.PI / 2);
      object.position.add(new THREE.Vector3(0, -4, -10));
      Fighter.planeModel = object;
      loadTower();
    },
    // called when loading is in progresses
    function (xhr) {},
    // called when loading has errors
    function (error) {
      console.log("An error occured while loading plane");
    }
  );
};
const loadTower = () => {
  container.innerHTML = "Loading tower...";
  loader.load(
    // resource URL
    `${siteurl}/models/rocket.glb`,
    // called when resource is loaded
    function (model) {
      const object = model.scene;
      object.scale.multiplyScalar(500, 500, 500);
      Tower.towerModel = object;
      loadTurret();
    },
    // called when loading is in progresses
    function (xhr) {},
    // called when loading has errors
    function (error) {
      console.log("An error occured while loading tower");
    }
  );
};

const loadTurret = () => {
  container.innerHTML = "Loading turret...";
  loader.load(
    // resource URL
    `${siteurl}/models/turret.glb`,
    // called when resource is loaded
    function (model) {
      const object = model.scene;
      object.scale.multiplyScalar(200, 200, 200);
      Turret.turretModel = object;
      loadTroop();
    },
    // called when loading is in progresses
    function (xhr) {},
    // called when loading has errors
    function (error) {
      console.log("An error occured while loading turret");
    }
  );
};

const loadTroop = () => {
  container.innerHTML = "Loading troop...";
  loader.load(
    // resource URL
    `${siteurl}/models/troop.glb`,
    // called when resource is loaded
    function (model) {
      const object = model.scene;
      object.scale.multiplyScalar(50);
      Troop.troopModel = object;
      loadShots();
    },
    // called when loading is in progresses
    function (xhr) {},
    // called when loading has errors
    function (error) {
      console.log("An error occured while loading troop");
    }
  );
};

const loadShots = () => {
  container.innerHTML = "Loading lasers...";
  audioLoader.load(`${siteurl}/sounds/laser.mp3`, function (buffer) {
    const sound = new THREE.Audio(audioListener);
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.5);
    Fighter.shootSound = sound;
    Turret.shootSound = sound;
    loadPop();
  });
};

const loadPop = () => {
  container.innerHTML = "Loading misc sounds...";
  audioLoader.load(`${siteurl}/sounds/pop.mp3`, function (buffer) {
    const sound = new THREE.Audio(audioListener);
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.5);
    Troop.hopSound = sound;
    Turret.placeSound = sound;
    loadSplat();
  });
};

const loadSplat = () => {
  container.innerHTML = "Loading misc sounds...";
  audioLoader.load(`${siteurl}/sounds/splat.mp3`, function (buffer) {
    const sound = new THREE.Audio(audioListener);
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.5);
    Troop.deathSound = sound;
    menuScreen();
  });
};

const menuScreen = () => {
  $("#viewcontainer").empty();
  $("#viewcontainer").append(`<h1>Sphere Defense</h2>`);
  $("#viewcontainer").append(
    `<img style="width: 30%;" src='images/logo.png' /><br>`
  );
  $("#viewcontainer").append(`<h4>Nathan Alam and Liam Johansson</h4>`);
  $("#viewcontainer").append(`<div id="optionContainer"></div>`);
  $("#optionContainer").append(
    "<button onclick='startGame()'>Start Game</button>"
  );
  $("#optionContainer").append(
    `<button id="instructions" onclick='showInstructions()'>Show Instructions</button>`
  );
  $("#optionContainer").append(
    "<button onclick='showSettings()'>Settings</button>"
  );
  $("#viewcontainer").append(
    `<a href="https://github.com/nathanalam/spheredefense">See it on Github</a>`
  );
};

showInstructions = () => {
  $("#instructions").remove();
  $("#viewcontainer").append(
    `<p>Defend against the incoming blobs by placing turrets and flying your plane.
    <br>Double click an empty tile to place a turret. Click on a turret to move it to an adjacent tile.
    <br>Press SHIFT to toggle between building and flying.
    <br>Use the mouse for changing directions and aiming. Left click to fire.
    <br>Hold SPACE to slow down the plane. </p>`
  );
};

export const displaySettings = () => {
  container.append(info);
  var gui = new dat.GUI();

  // var options = {
  //   togglePhase: function () {
  //     stats.phase = stats.phase == "build" ? "flight" : "build";
  //   },
  // };

  gui.add(settings, "LIVES").min(1).max(15).step(1).name("Lives").listen();
  gui
    .add(settings, "SPAWN_RATE")
    .min(0)
    .max(1)
    .step(0.025)
    .name("Spawn Rate")
    .listen();
  gui
    .add(settings, "MAX_TURRETS")
    .min(0)
    .max(30)
    .step(1)
    .name("Max Turrets")
    .listen();
  gui
    .add(settings, "ENEMY_SPEED")
    .min(0)
    .max(5)
    .step(0.5)
    .name("Enemy Speed")
    .listen();
  gui
    .add(settings, "TURRET_RANGE")
    .min(0)
    .max(1000)
    .step(50)
    .name("Turret Range")
    .listen();
  gui
    .add(settings, "TURRET_DAMAGE")
    .min(0)
    .max(200)
    .step(10)
    .name("Turret Damage")
    .listen();
  gui
    .add(settings, "TURRET_FIRE_RATE")
    .min(0.5)
    .max(5)
    .step(0.5)
    .name("Fire Rate")
    .listen();
  gui
    .add(settings, "PLANE_DAMAGE")
    .min(0)
    .max(200)
    .step(25)
    .name("Plane Damage")
    .listen();
  gui
    .add(settings, "PLANE_MAX_SPEED")
    .min(1)
    .max(20)
    .step(1)
    .name("Plane Speed")
    .listen();
  $("#viewcontainer").empty();
  $("#viewcontainer").append(`<div id="optionContainer"></div>`);
  $("#optionContainer").append("<button onclick='reload()'>Save</button>");
};

export const appendGUI = () => {
  $("#viewcontainer").append(`<div id="info">
    <h2>Sphere Defense</h2>
    <p id="student">Nathan Alam and Liam Johansson
    </p>
    <p>Lives: <span id="lives"></span></p>
    <p>Score: <span id="score"></span></p>
    <p>Available Turrets: <span id="turrets-remaining"></span></p>
  </div>
  `);
};
