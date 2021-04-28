// The board

let getObj = () => {
  const sphereGeo = new THREE.SphereGeometry(settings.WORLD_RADIUS);
  const greenMat = new THREE.MeshPhongMaterial({ color: 0x038f08 });
  const board = new THREE.Mesh(sphereGeo, greenMat);
  board.position.set(0, 0, 0);
  board.timeStep = (time) => {};

  const edges = new THREE.EdgesGeometry(sphereGeo);
  const lines = new THREE.LineSegments(
    edges,
    new THREE.LineDashedMaterial({ color: 0x000000, dashSize: 3, gapSize: 5 })
  );
  lines.computeLineDistances();
  lines.position.set(0, 0, 0);
  lines.timeStep = (time) => {};
  return [board, lines];
};
export const board = getObj()[0];
export const tileLines = getObj()[1];
