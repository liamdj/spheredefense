// The board

let getObj = () => {
  const sphereGeo = new THREE.SphereGeometry(settings.WORLD_RADIUS);
  const greenMat = new THREE.MeshPhongMaterial({ color: 0x038f08 });
  const board = new THREE.Mesh(sphereGeo, greenMat);
  board.position.set(0, 0, 0);
  board.timeStep = (time) => {};
  return board;
};
export const board = getObj();
