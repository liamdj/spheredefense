// The board

let getObj = () => {
  // the board itself
  const sphereGeo = new THREE.SphereGeometry(settings.WORLD_RADIUS, 40, 40);
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
      turret: undefined,
      available: false,
    });
  }
  const getTileCentroid = (tile, meshPosition) => {
    return {
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
  };

  // now, compute adjacentTiles, distance to tile 0
  tiles.forEach((tile, index) => {
    const adjacents = [];
    const verts = [tile.a, tile.b, tile.c];
    tiles.forEach((otile, oindex) => {
      if (
        index != oindex &&
        (verts.includes(otile.a) ||
          verts.includes(otile.b) ||
          verts.includes(otile.c))
      )
        adjacents.push(otile);
    });
    tile.adjacents = adjacents;
    tile.centroid = getTileCentroid(tile, board.geometry.attributes.position);
    tile.distanceFromOrigin = Math.sqrt(
      Math.pow(tile.centroid.x - tiles[0].centroid.x, 2) +
        Math.pow(tile.centroid.y - tiles[0].centroid.y, 2) +
        Math.pow(tile.centroid.z - tiles[0].centroid.z, 2)
    );
  });

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
