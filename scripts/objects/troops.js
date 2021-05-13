export class Troop {
  static timeOfHop = 0.0001 * 800;
  static timeBetweenHops = 0.0001 * 4000;
  static dropTime = 600;
  static range = 50;
  static maxHealth = 100;
  static dropHeight = settings.WORLD_RADIUS;
  static troopModel = new THREE.Object3D();
  static hopSound = new THREE.Audio(new THREE.AudioListener());
  static deathSound = new THREE.Audio(new THREE.AudioListener());
  static geometry = new THREE.SphereGeometry(20);
  static material = new THREE.MeshBasicMaterial({
    color: settings.ENEMY_COLOR,
    visible: false
  });

  constructor(tile, time) {
    // copy troop mesh appearance
    this.mesh = new THREE.Group();
    const sphere = new THREE.Mesh(Troop.geometry, Troop.material);
    this.mesh.add(sphere);
    const model = Troop.troopModel.clone();
    model.position.set(0, 0, -6)
    this.mesh.add(model);

    // set initial tile coordinates
    this.tile = tile;
    this.mesh.position.addScaledVector(tile.centroid, 2);
    this.falling = true;
    this.hopping = false;
    this.waitTimeStart = time;

    this.speed = settings.ENEMY_SPEED;
    this.health = 100;
    this.size = 1;
    this.type = "TROOP";
    this.damage = 10;
  }

  get isGone() {
    return this.health <= 0;
  }

  // animate tile to tile movement
  timeStep = (time) => {
    // set size according to health
    const frac = this.health / Troop.maxHealth;
    if (frac < this.size) {
      this.size = Math.max(this.size - 0.03, frac);
    } else if (frac > this.size) {
      this.size = Math.min(this.size + 0.03, frac);
    }
    const scale = 0.5 + this.size;
    this.mesh.scale.set(scale, scale, scale);

    if (this.falling) {
      const distVect = new THREE.Vector3(
        this.mesh.position.x,
        this.mesh.position.y,
        this.mesh.position.z
      );
      distVect.sub(this.tile.centroid);
      if (distVect.length() < 2) {
        this.falling = false;
        this.waitTimeStart = time;
        this.mesh.position.multiplyScalar(0);
        this.mesh.position.addScaledVector(this.tile.centroid, 1.025);
        Troop.hopSound.play();
      } else {
        distVect.normalize();
        distVect.multiplyScalar((-1 * Troop.dropHeight) / Troop.dropTime);
        this.mesh.position.add(distVect);
      }
    }
    if (this.hopping) {
      // move towards its tile
      const t = Math.min(
        ((time - this.hopStartTime) * this.speed) / Troop.timeOfHop,
        1
      );
      const s = (1 + 4 * (t - 0.5) * Math.abs(t - 0.5)) / 2;
      this.curve.getPointAt(s, this.mesh.position);
      if (t >= 1) {
        this.hopping = false;
        this.waitTimeStart = time;
        this.health += 40;
        // Troop.hopSound.play();
      }
    } else if (
      (time - this.waitTimeStart) * this.speed >= Troop.timeBetweenHops &&
      !this.falling
    ) {
      // find the tile closest to the tower
      let closestTile = this.tile.adjacents[0];
      this.tile.adjacents.forEach((adjacentTile) => {
        if (adjacentTile.distanceFromOrigin < closestTile.distanceFromOrigin) {
          closestTile = adjacentTile;
        }
      });
      this.tile = closestTile;
      // produce new curve
      const endpoint = new THREE.Vector3().addScaledVector(
        closestTile.centroid,
        1.025
      );
      const midpoint1 = new THREE.Vector3()
        .addScaledVector(this.mesh.position, 0.7)
        .addScaledVector(endpoint, 0.4);
      const midpoint2 = new THREE.Vector3()
        .addScaledVector(this.mesh.position, 0.4)
        .addScaledVector(endpoint, 0.7);
      this.curve = new THREE.CatmullRomCurve3(
        [this.mesh.position, midpoint1, midpoint2, endpoint],
        "chordal"
      );
      this.hopStartTime = time;
      this.hopping = true;
    }
  };
}
