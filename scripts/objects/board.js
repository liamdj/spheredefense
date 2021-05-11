export class Board {
  static planetModel = new THREE.Object3D();
  constructor() {
    // the board itself
    const boardGeo = new THREE.IcosahedronGeometry(
      settings.WORLD_RADIUS,
      7
    ).toIndexed();
    const boardMat = new THREE.MeshLambertMaterial({
      wireframe: true,
      visible: false,
    });
    this.mesh = new THREE.Mesh(boardGeo, boardMat);
    this.mesh.position.set(0, 0, 0);

    // visual elements
    this.group = new THREE.Group();
    this.group.add(Board.planetModel);
    this.mesh.add(this.group);

    // a grid for the edges around the board
    const edges = new THREE.EdgesGeometry(boardGeo);
    this.lines = {};
    this.lines.mesh = new THREE.LineSegments(
      edges,
      new THREE.LineDashedMaterial({ color: 0x000000, dashSize: 3, gapSize: 5 })
    );
    this.lines.mesh.computeLineDistances();
    this.lines.mesh.position.set(0, 0, 0);
    this.lines.timeStep = (time) => {};

    // an array that abstractly represents tile vertices which may or may not be mesh vertices
    const tiles = [];
    for (let index = 0; index < boardGeo.index.array.length; index += 3) {
      tiles.push({
        a: boardGeo.index.array[index],
        b: boardGeo.index.array[index + 1],
        c: boardGeo.index.array[index + 2],
        selected: false,
        turret: undefined,
        available: false,
      });
    }

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
      tile.centroid = this.getTileCentroid(tile, boardGeo.attributes.position);
      tile.distanceFromOrigin = Math.sqrt(
        Math.pow(tile.centroid.x - tiles[0].centroid.x, 2) +
          Math.pow(tile.centroid.y - tiles[0].centroid.y, 2) +
          Math.pow(tile.centroid.z - tiles[0].centroid.z, 2)
      );
    });

    this.tiles = tiles;
    // an array that maps a face index to a tile index
    this.faceToTile = [];
    for (let index = 0; index < boardGeo.index.array.length / 3; index++) {
      this.faceToTile.push(index);
    }
  }

  timeStep = (time) => {};

  getTileCentroid = (tile, meshPosition) => {
    return new THREE.Vector3(
      (meshPosition.getX(tile.a) +
        meshPosition.getX(tile.b) +
        meshPosition.getX(tile.c)) /
        3,
      (meshPosition.getY(tile.a) +
        meshPosition.getY(tile.b) +
        meshPosition.getY(tile.c)) /
        3,
      (meshPosition.getZ(tile.a) +
        meshPosition.getZ(tile.b) +
        meshPosition.getZ(tile.c)) /
        3
    );
  };
}
