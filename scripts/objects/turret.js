export const turret = (tile, normal) => {
  const position = tile.centroid;

  const geometry = new THREE.CylinderGeometry(10, 10, 40, 32);
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
      turret.position.set(turret.toPos.x, turret.toPos.y, turret.toPos.z);
      turret.moving = false;
      turret.fromTile.turret = undefined;
      turret.toTile.turret = turret;
    }
  };
  return turret;
};
