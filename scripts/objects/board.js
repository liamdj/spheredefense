// The board

let getObj = () => {
    const boardGeo = new THREE.IcosahedronGeometry(settings.WORLD_RADIUS, 2);
    const boardMat = new THREE.MeshLambertMaterial({ color: 0x34c29a });
    const mesh = new THREE.Mesh(boardGeo, boardMat);

    const edgeGeo = new THREE.WireframeGeometry(boardGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const edges = new THREE.LineSegments(edgeGeo, lineMat);

    mesh.position.set(0, 0, 0);
    mesh.timeStep = (time) => { };
    mesh.add(edges)
    return mesh;
};
export const board = getObj();
