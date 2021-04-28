export const turret = (position, normal) => {
  const geometry = new THREE.CylinderGeometry(10, 10, 40, 32);
  const material = new THREE.MeshBasicMaterial({
    color: settings.TEAM_1_COLOR,
  });
  const turret = new THREE.Mesh(geometry, material);

  turret.position.set(position.x, position.y, position.z);
  turret.rotateX(Math.PI * normal.x);
  turret.rotateY(Math.PI * normal.y);
  turret.rotateZ(Math.PI * normal.z);

  turret.timeStep = (time) => {};
  return turret;
};
