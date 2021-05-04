export class Tower {
  constructor(tile) {
    const position = tile.centroid;
    const normal = new THREE.Vector3(position.x, position.y, position.z);
    const unitY = new THREE.Vector3(0, 1, 0);
    normal.normalize();
    const geometry = new THREE.CylinderGeometry(10, 10, 40, 32);
    const material = new THREE.MeshBasicMaterial({
      color: settings.TEAM_1_COLOR,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(position.x, position.y, position.z);
    this.type = "TOWER";
    this.health = 1000;
  }

  timeStep = (time) => {};
}
