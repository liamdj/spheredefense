export class Tower {
  constructor(tile) {
    const position = tile.centroid;
    const normal = new THREE.Vector3(position.x, position.y, position.z);
    normal.normalize();
    this.mesh = new THREE.Object3D();
    this.group = new THREE.Group();
    const addObj = (obj) => this.group.add(obj);
    const loader = new THREE.OBJLoader();
    loader.load(
      // resource tower
      "../../obj/tower.obj",
      // called when resource is loaded
      function (object) {
        object.scale.multiplyScalar(10);
        addObj(object);
      },
      // called when loading is in progresses
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // called when loading has errors
      function (error) {
        console.log("An error occured while loading");
      }
    );
    this.mesh.add(this.group);
    this.mesh.position.set(position.x, position.y, position.z);
    this.type = "TOWER";
    this.health = 1000;
  }

  timeStep = (time) => {};
}
