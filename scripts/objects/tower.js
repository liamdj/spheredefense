export class Tower {
  static towerModel = new THREE.Object3D();

  constructor(tile) {
    const normal = tile.centroid.clone().normalize();

    // generate tower appearance
    this.mesh = new THREE.Object3D();
    this.group = new THREE.Group();
    this.group.add(Tower.towerModel);
    this.mesh.add(this.group);
    this.mesh.position.copy(tile.centroid);
    this.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    this.mesh.scale.multiplyScalar(1.5);

    this.type = "TOWER";
  }

  get isGone() {
    return stats.lives <= 0;
  }

  timeStep = (time) => { };
}
