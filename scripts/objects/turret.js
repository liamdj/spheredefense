export const turret = (tile, meshPosition, normal) => {
  const position = {
    x:
      (meshPosition.getX(tile.a) +
        meshPosition.getX(tile.b) +
        meshPosition.getX(tile.c)) /
      3,
    y:
      (meshPosition.getY(tile.a) +
        meshPosition.getY(tile.b) +
        meshPosition.getY(tile.c)) /
      3,
    z:
      (meshPosition.getZ(tile.a) +
        meshPosition.getZ(tile.b) +
        meshPosition.getZ(tile.c)) /
      3,
  };

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
    turret.fromPos = {
      x:
        (meshPosition.getX(fromTile.a) +
          meshPosition.getX(fromTile.b) +
          meshPosition.getX(fromTile.c)) /
        3,
      y:
        (meshPosition.getY(fromTile.a) +
          meshPosition.getY(fromTile.b) +
          meshPosition.getY(fromTile.c)) /
        3,
      z:
        (meshPosition.getZ(fromTile.a) +
          meshPosition.getZ(fromTile.b) +
          meshPosition.getZ(fromTile.c)) /
        3,
    };
    turret.toPos = {
      x:
        (meshPosition.getX(toTile.a) +
          meshPosition.getX(toTile.b) +
          meshPosition.getX(toTile.c)) /
        3,
      y:
        (meshPosition.getY(toTile.a) +
          meshPosition.getY(toTile.b) +
          meshPosition.getY(toTile.c)) /
        3,
      z:
        (meshPosition.getZ(toTile.a) +
          meshPosition.getZ(toTile.b) +
          meshPosition.getZ(toTile.c)) /
        3,
    };
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
