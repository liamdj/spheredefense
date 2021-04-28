// The board

let getObj = () => {
  // the board itself
  const sphereGeo = new THREE.SphereGeometry(settings.WORLD_RADIUS);
  const greenMat = new THREE.MeshPhongMaterial({ color: 0x038f08 });
  const board = new THREE.Mesh(sphereGeo, greenMat);
  board.position.set(0, 0, 0);
  board.timeStep = (time) => {};

  // a grid for the edges around the board
  const edges = new THREE.EdgesGeometry(sphereGeo);
  const lines = new THREE.LineSegments(
    edges,
    new THREE.LineDashedMaterial({ color: 0x000000, dashSize: 3, gapSize: 5 })
  );
  lines.computeLineDistances();
  lines.position.set(0, 0, 0);
  lines.timeStep = (time) => {};

  // an object that abstractly represents tile vertices which may or may not be mesh vertices
  const tiles = [];
  for (let index = 0; index < sphereGeo.index.array.length; index += 3) {
    tiles.push({
      a: sphereGeo.index.array[index],
      b: sphereGeo.index.array[index + 1],
      c: sphereGeo.index.array[index + 2],
      selected: false,
    });
  }

  // an array that maps a face index to a tile index
  const faceToTile = [];
  for (let index = 0; index < sphereGeo.index.array.length / 3; index++) {
    faceToTile.push(index);
  }

  return [board, lines, tiles, faceToTile];
};

getObj = getObj();

export const board = getObj[0];
export const tileLines = getObj[1];
export const tiles = getObj[2];
export const faceToTile = getObj[3];
