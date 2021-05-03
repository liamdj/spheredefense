export const tower = (tile) => {
  const position = tile.centroid;
  const normal = new THREE.Vector3(position.x, position.y, position.z);
  const unitY = new THREE.Vector3(0, 1, 0);
  normal.normalize();
  const geometry = new THREE.CylinderGeometry(10, 10, 40, 32);
  const material = new THREE.MeshBasicMaterial({
    color: settings.TEAM_1_COLOR,
  });
  const tower = new THREE.Mesh(geometry, material);
  tower.position.set(position.x, position.y, position.z);
  tower.type = "TOWER";
  tower.health = 1000;
  // tower.rotateX(Math.PI * normal.x);
  // tower.rotateY(Math.PI * normal.y);
  // tower.rotateZ(Math.PI * normal.z);

  tower.timeStep = (time) => {};
  return tower;
};
