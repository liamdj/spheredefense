export class Troop {
  constructor(tile) {
    const geometry = new THREE.SphereGeometry(10);
    const material = new THREE.MeshBasicMaterial({
      color: settings.TEAM_2_COLOR,
    });

    this.mesh = new THREE.Mesh(geometry, material);

    // set initial tile coordinates
    this.mesh.position.set(tile.centroid.x, tile.centroid.y, tile.centroid.z);
    this.tile = tile;
    this.moving = true;
    this.speed = 0.1;
    this.health = 100;
    this.maxHealth = 100;
    this.type = "TROOP";
    this.range = 10;
    this.damage = 10;
  }

  // animate tile to tile movement
  timeStep = (time) => {
    if (this.moving) {
      // move towards its tile
      const step = new THREE.Vector3(
        this.tile.centroid.x - this.mesh.position.x,
        this.tile.centroid.y - this.mesh.position.y,
        this.tile.centroid.z - this.mesh.position.z
      );
      if (step.length() < 0.1) {
        this.moving = false;
      }
      step.normalize().multiplyScalar(this.speed);
      this.mesh.position.set(
        step.x + this.mesh.position.x,
        step.y + this.mesh.position.y,
        step.z + this.mesh.position.z
      );
    } else {
      // find the tile closest to the tower
      let closestTile = this.tile.adjacents[0];
      this.tile.adjacents.forEach((adjacentTile) => {
        if (adjacentTile.distanceFromOrigin < closestTile.distanceFromOrigin) {
          closestTile = adjacentTile;
        }
      });
      this.tile = closestTile;
      this.moving = true;
    }
  };
}
