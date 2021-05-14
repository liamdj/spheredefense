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
    const boardArray = boardGeo.attributes.position.array;
    for (let index = 0; index < boardArray.length; index += 3) {
      const oldPoint = new THREE.Vector3(
        boardArray[index],
        boardArray[index + 1],
        boardArray[index + 2]
      );
      const viewPoint = oldPoint.clone().multiplyScalar(1.5);
      const ray = new THREE.Raycaster(
        viewPoint,
        oldPoint.sub(viewPoint).normalize()
      );
      const intersects = ray.intersectObject(Board.planetModel, true);
      const intersect = intersects[0];
      if (intersect) {
        const scale = new THREE.Vector3(1, 1, 1);
        let childObj = intersect.object.parent;
        let maxCount = 10;
        while (childObj.parent && maxCount > 0) {
          scale.multiply(childObj.scale);
          childObj = childObj.parent;
          maxCount -= 1;
        }
        intersect.point.multiply(scale).multiplyScalar(1.01);
        boardArray[index] = intersect.point.x;
        boardArray[index + 1] = intersect.point.y;
        boardArray[index + 2] = intersect.point.z;
      }
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
    });
    // recursively get distance from tile 0
    const setAdjacentDistances = (tile) => {
      tile.adjacents.forEach((adjTile) => {
        const thisDist =
          tile.distanceFromOrigin +
          Math.sqrt(
            Math.pow(adjTile.centroid.x - tile.centroid.x, 2) +
              Math.pow(adjTile.centroid.y - tile.centroid.y, 2) +
              Math.pow(adjTile.centroid.z - tile.centroid.z, 2)
          );
        if (
          adjTile.distanceFromOrigin == undefined ||
          adjTile.distanceFromOrigin > thisDist
        ) {
          adjTile.distanceFromOrigin = thisDist;
          setAdjacentDistances(adjTile);
        }
      });
    };
    tiles[0].distanceFromOrigin = 0;
    setAdjacentDistances(tiles[0]);

    this.tiles = tiles;
    // an array that maps a face index to a tile index
    this.faceToTile = [];
    for (let index = 0; index < boardGeo.index.array.length / 3; index++) {
      this.faceToTile.push(index);
    }
  }

  timeStep = (time) => {};

  getTileCentroid = (tile, meshPosition) => {
    let overlayCentroid = new THREE.Vector3(
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
    const viewPoint = overlayCentroid.clone().multiplyScalar(1.5);
    const ray = new THREE.Raycaster(
      viewPoint,
      overlayCentroid.clone().sub(viewPoint).normalize()
    );
    const intersects = ray.intersectObject(Board.planetModel, true);
    const intersect = intersects[0];
    if (intersect) {
      const scale = new THREE.Vector3(1, 1, 1);
      let childObj = intersect.object.parent;
      let maxCount = 10;
      while (childObj.parent && maxCount > 0) {
        scale.multiply(childObj.scale);
        childObj = childObj.parent;
        maxCount -= 1;
      }
      intersect.point.multiply(scale);
      overlayCentroid = intersect.point;
    }
    return overlayCentroid;
  };
}
