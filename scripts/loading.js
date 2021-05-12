import { Fighter } from "./objects/fighter.js";
import { Turret } from "./objects/turret.js";
import { Star } from "./objects/stars.js";
import { Board } from "./objects/board.js";
import { Tower } from "./objects/tower.js";
import { Troop } from "./objects/troops.js";

export const loadWorld = (
  container,
  loader,
  audioLoader,
  audioListener,
  callback,
  mtlloader,
  objLoader
) => {
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
          loadStar(container, loader, audioLoader, audioListener, callback);
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
const loadStar = (container, loader, audioLoader, audioListener, callback) => {
  container.innerHTML = "Loading stars...";
  loader.load(
    // resource URL
    `${siteurl}/models/star.glb`,
    // called when resource is loaded
    function (model) {
      const object = model.scene;
      object.scale.multiplyScalar(100);
      Star.starModel = object;
      loadPlane(container, loader, audioLoader, audioListener, callback);
    },
    // called when loading is in progresses
    function (xhr) {},
    // called when loading has errors
    function (error) {
      console.log("An error occured while loading stars");
    }
  );
};
const loadPlane = (container, loader, audioLoader, audioListener, callback) => {
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
      loadTower(container, loader, audioLoader, audioListener, callback);
    },
    // called when loading is in progresses
    function (xhr) {},
    // called when loading has errors
    function (error) {
      console.log("An error occured while loading plane");
    }
  );
};
const loadTower = (container, loader, audioLoader, audioListener, callback) => {
  container.innerHTML = "Loading tower...";
  loader.load(
    // resource URL
    `${siteurl}/models/rocket.glb`,
    // called when resource is loaded
    function (model) {
      const object = model.scene;
      object.scale.multiplyScalar(500, 500, 500);
      Tower.towerModel = object;
      loadTurret(container, loader, audioLoader, audioListener, callback);
    },
    // called when loading is in progresses
    function (xhr) {},
    // called when loading has errors
    function (error) {
      console.log("An error occured while loading tower");
    }
  );
};

const loadTurret = (
  container,
  loader,
  audioLoader,
  audioListener,
  callback
) => {
  container.innerHTML = "Loading turret...";
  loader.load(
    // resource URL
    `${siteurl}/models/turret.glb`,
    // called when resource is loaded
    function (model) {
      const object = model.scene;
      object.scale.multiplyScalar(200, 200, 200);
      Turret.turretModel = object;
      loadTroop(container, loader, audioLoader, audioListener, callback);
    },
    // called when loading is in progresses
    function (xhr) {},
    // called when loading has errors
    function (error) {
      console.log("An error occured while loading turret");
    }
  );
};

const loadTroop = (container, loader, audioLoader, audioListener, callback) => {
  container.innerHTML = "Loading troop...";
  loader.load(
    // resource URL
    `${siteurl}/models/troop.glb`,
    // called when resource is loaded
    function (model) {
      const object = model.scene;
      object.scale.multiplyScalar(50);
      Troop.troopModel = object;
      loadShots(container, loader, audioLoader, audioListener, callback);
    },
    // called when loading is in progresses
    function (xhr) {},
    // called when loading has errors
    function (error) {
      console.log("An error occured while loading troop");
    }
  );
};

const loadShots = (container, loader, audioLoader, audioListener, callback) => {
  container.innerHTML = "Loading lasers...";
  audioLoader.load(`${siteurl}/sounds/laser.mp3`, function (buffer) {
    const sound = new THREE.Audio(audioListener);
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.5);
    Fighter.shootSound = sound;
    Turret.shootSound = sound;
    loadPop(container, loader, audioLoader, audioListener, callback);
  });
};

const loadPop = (container, loader, audioLoader, audioListener, callback) => {
  container.innerHTML = "Loading misc sounds...";
  audioLoader.load(`${siteurl}/sounds/pop.mp3`, function (buffer) {
    const sound = new THREE.Audio(audioListener);
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.5);
    Troop.hopSound = sound;
    Turret.placeSound = sound;
    loadSplat(container, loader, audioLoader, audioListener, callback);
  });
};

const loadSplat = (container, loader, audioLoader, audioListener, callback) => {
  container.innerHTML = "Loading misc sounds...";
  audioLoader.load(`${siteurl}/sounds/splat.mp3`, function (buffer) {
    const sound = new THREE.Audio(audioListener);
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.5);
    Troop.deathSound = sound;
    callback();
  });
};
