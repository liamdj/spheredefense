let getObj = () => {
  const geometry = new THREE.CylinderGeometry(10, 10, 40, 32);
  const team1material = new THREE.MeshBasicMaterial({
    color: settings.TEAM_1_COLOR,
  });
  const team2material = new THREE.MeshBasicMaterial({
    color: settings.TEAM_2_COLOR,
  });
  const tower1 = new THREE.Mesh(geometry, team1material);
  const tower2 = new THREE.Mesh(geometry, team2material);
  tower1.rotateZ(Math.PI / 2);
  tower2.rotateZ((-1 * Math.PI) / 2);
  tower1.position.set(-1 * settings.WORLD_RADIUS, 0, 0);
  tower2.position.set(+1 * settings.WORLD_RADIUS, 0, 0);

  tower1.timeStep = (time) => {};
  tower2.timeStep = (time) => {};
  return [tower1, tower2];
};
export const towers = getObj();
