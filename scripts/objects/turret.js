export class Turret {
  static range = settings.TURRET_RANGE;
  static damage = settings.TURRET_DAMAGE;
  static timeOfHop = 0.0001 * 800;

  constructor(tile, normal) {
    const geometry = new THREE.CylinderGeometry(5, 4, 5, 32);
    const material = new THREE.MeshBasicMaterial({
      color: settings.TEAM_1_COLOR,
    });
    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.position.addScaledVector(tile.centroid, 1.025);
    this.mesh.rotateX(Math.PI * normal.x);
    this.mesh.rotateY(Math.PI * normal.y);
    this.mesh.rotateZ(Math.PI * normal.z);

    this.hopping = false;
    this.hopStartTime = 0;
    this.speed = 1;
    this.toPos = undefined;
    this.toTile = undefined;
    this.fromPos = this.mesh.position;
    this.fromTile = tile;
    this.type = "TURRET";
    this.range = Turret.range;
    this.damage = Turret.damage;
  }

  moveFromTo = (fromTile, toTile) => {
    this.fromPos = fromTile.centroid;
    this.toPos = toTile.centroid;
    this.fromTile = fromTile;
    this.toTile = toTile;
    // make sure no other turrets can move to target tile meanwhile
    this.toTile.turret = 1;

    // produce new curve
    const endpoint = new THREE.Vector3().addScaledVector(
      this.toTile.centroid,
      1.025
    );
    const midpoint1 = new THREE.Vector3()
        .addScaledVector(this.fromTile.centroid, 0.7)
        .addScaledVector(endpoint, 0.4);
    const midpoint2 = new THREE.Vector3()
        .addScaledVector(this.fromTile.centroid, 0.4)
        .addScaledVector(endpoint, 0.7);
    this.curve = new THREE.CatmullRomCurve3(
        [this.mesh.position, midpoint1, midpoint2, endpoint],
        "chordal"
    );
    this.hopping = true;
  };

  timeStep = (time) => {
    if (this.hopping) {
      // hop towards its tile
      const t = Math.min(
          ((time - this.hopStartTime) * this.speed) / Turret.timeOfHop,
          1
      );
      const s = (1 + 4 * (t - 0.5) * Math.abs(t - 0.5)) / 2;
      if(!isNaN(s))
        this.curve.getPointAt(s, this.mesh.position)
      if (s >= 1) {
          this.hopping = false;
          this.fromTile.turret = undefined;
          this.curve = undefined;
          this.mesh.position.multiplyScalar(0);
          this.mesh.position.addScaledVector(
            this.toTile.centroid,
            1.025
          );
          this.toTile.turret = this;
      } 
      
    } else {
      this.hopStartTime = time;
    }
    
  };
}
