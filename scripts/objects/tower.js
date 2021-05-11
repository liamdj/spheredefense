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

    this.type = "TOWER";
    this.health = 1000;
    this.maxHealth = 1000;
  }

  get isGone() {
    return this.health <= 0;
  }

  timeStep = (time) => {
    const size = 0.25 + (0.75 * this.health) / this.maxHealth;
    this.mesh.scale.set(size, size, size);
  };
}
