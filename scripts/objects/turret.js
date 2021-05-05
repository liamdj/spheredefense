export class Turret {
  constructor(tile, normal) {
    const position = tile.centroid;
    const geometry = new THREE.CylinderGeometry(5, 4, 5, 32);
    const material = new THREE.MeshBasicMaterial({
      color: settings.TEAM_1_COLOR,
    });
    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.rotateX(Math.PI * normal.x);
    this.mesh.rotateY(Math.PI * normal.y);
    this.mesh.rotateZ(Math.PI * normal.z);

    this.moving = false;
    this.speed = 0.5;
    this.toPos = undefined;
    this.toTile = undefined;
    this.fromPos = this.mesh.position;
    this.fromTile = tile;
    this.type = "TURRET";
    this.range = 50;
    this.damage = 0.5;
  }

  moveFromTo = (fromTile, toTile) => {
    this.fromPos = fromTile.centroid;
    this.toPos = toTile.centroid;
    this.fromTile = fromTile;
    this.toTile = toTile;
    // make sure no other turrets can move to target tile meanwhile
    this.toTile.turret = 1;
    this.moving = true;
  };

  timeStep = (time) => {
    if (this.moving) {
      // move towards its tile
      const step = new THREE.Vector3(
        this.toTile.centroid.x - this.mesh.position.x,
        this.toTile.centroid.y - this.mesh.position.y,
        this.toTile.centroid.z - this.mesh.position.z
      );
      if (step.length() < 1) {
        this.moving = false;
        this.fromTile.turret = undefined;
        this.toTile.turret = this;
      }
      step.normalize().multiplyScalar(this.speed);
      this.mesh.position.set(
        step.x + this.mesh.position.x,
        step.y + this.mesh.position.y,
        step.z + this.mesh.position.z
      );
    }
  };
}
