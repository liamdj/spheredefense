import { Bullet } from "./bullets.js";

export class Turret {
  static timeOfHop = 0.0001 * 800;
  static timeBetweenShots = 0.0001 * 2000 / settings.TURRET_FIRE_RATE;
  static turretModel = new THREE.Object3D();
  static shootSound = new THREE.Audio(new THREE.AudioListener());
  static placeSound = new THREE.Audio(new THREE.AudioListener());

  constructor(tile, normal) {
    // generate turret appearance
    this.mesh = new THREE.Object3D();
    this.group = new THREE.Group();
    this.group.add(Turret.turretModel.clone());
    this.mesh.add(this.group);
    this.mesh.position.addScaledVector(tile.centroid, 1.025);
    this.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

    this.timeLastFired = 0;
    this.dead = false;
    this.hopping = false;
    this.hopStartTime = 0;
    this.speed = 1;
    this.toPos = undefined;
    this.toTile = undefined;
    this.fromPos = this.mesh.position;
    this.fromTile = tile;
    this.type = "TURRET";
    this.range = settings.TURRET_RANGE;
    this.damage = settings.TURRET_DAMAGE;
    Turret.placeSound.play();
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
      if (!isNaN(s)) this.curve.getPointAt(s, this.mesh.position);
      if (s >= 1) {
        Turret.placeSound.play();
        this.hopping = false;
        this.fromTile.turret = undefined;
        this.curve = undefined;
        this.mesh.position.multiplyScalar(0);
        this.mesh.position.addScaledVector(this.toTile.centroid, 1.025);
        this.toTile.turret = this;
      }
    } else {
      this.hopStartTime = time;
    }
  };

  get isGone() {
    return this.dead;
  }

  attemptFireBullet = (targetPos, time) => {
    if (time < this.timeLastFired + Turret.timeBetweenShots) return;
    this.timeLastFired = time;
    Turret.shootSound.play();
    return new Bullet(
      this.mesh.position,
      new THREE.Vector3().subVectors(targetPos, this.mesh.position)
    );
  };
}
