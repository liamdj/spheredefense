export const turret = (tile, normal) => {
  const position = tile.centroid;

  const geometry = new THREE.CylinderGeometry(5, 4, 5, 32);
  const material = new THREE.MeshBasicMaterial({
    color: settings.TEAM_1_COLOR,
  });
  const turret = new THREE.Mesh(geometry, material);

  turret.position.set(position.x, position.y, position.z);
  turret.rotateX(Math.PI * normal.x);
  turret.rotateY(Math.PI * normal.y);
  turret.rotateZ(Math.PI * normal.z);

  turret.moving = false;
  turret.speed = 0.1;
  turret.toPos = undefined;
  turret.toTile = undefined;
  turret.fromPos = turret.position;
  turret.fromTile = tile;

  turret.moveFromTo = (fromTile, toTile) => {
    turret.fromPos = fromTile.centroid;
    turret.toPos = toTile.centroid;
    turret.fromTile = fromTile;
    turret.toTile = toTile;
    turret.moving = true;
  };

  turret.timeStep = (time) => {
    if (turret.moving) {
      // move towards its tile
      const step = new THREE.Vector3(
        turret.toTile.centroid.x - turret.position.x,
        turret.toTile.centroid.y - turret.position.y,
        turret.toTile.centroid.z - turret.position.z
      );
      if (step.length() < 0.1) {
        turret.moving = false;
        turret.fromTile.turret = undefined;
        turret.toTile.turret = turret;
      }
      step.normalize().multiplyScalar(turret.speed);
      turret.position.set(
        step.x + turret.position.x,
        step.y + turret.position.y,
        step.z + turret.position.z
      );
    }
  };
  return turret;
};
