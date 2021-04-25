export const troop = (tile) => {
  const geometry = new THREE.SphereGeometry(10);
  const material = new THREE.MeshBasicMaterial({
    color: settings.TEAM_2_COLOR,
  });

  const troop = new THREE.Mesh(geometry, material);

  // set initial tile coordinates
  troop.position.set(tile.centroid.x, tile.centroid.y, tile.centroid.z);
  troop.tile = tile;
  troop.moving = true;
  troop.speed = 0.1;
  troop.health = 100;
  troop.type = "TROOP";
  troop.range = 10;
  troop.damage = 10;

  // animate tile to tile movement
  troop.timeStep = (time) => {
    if (troop.moving) {
      // move towards its tile
      const step = new THREE.Vector3(
        troop.tile.centroid.x - troop.position.x,
        troop.tile.centroid.y - troop.position.y,
        troop.tile.centroid.z - troop.position.z
      );
      if (step.length() < 0.1) {
        troop.moving = false;
      }
      step.normalize().multiplyScalar(troop.speed);
      troop.position.set(
        step.x + troop.position.x,
        step.y + troop.position.y,
        step.z + troop.position.z
      );
    } else {
      // find the tile closest to the tower
      let closestTile = troop.tile.adjacents[0];
      troop.tile.adjacents.forEach((adjacentTile) => {
        if (adjacentTile.distanceFromOrigin < closestTile.distanceFromOrigin) {
          closestTile = adjacentTile;
        }
      });
      troop.tile = closestTile;
      troop.moving = true;
    }
  };

  return troop;
};
