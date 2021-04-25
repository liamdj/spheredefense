// The board

let getObj = () => {
    const sphereGeo = new THREE.BoxGeometry(1, 1, 1);
    const greenMat = new THREE.MeshPhongMaterial({ color: 0x038f08 });
    const board = new THREE.Mesh(sphereGeo, greenMat);
    board.position.set(0, 0, -5);
    board.update = (time) => {
    
    };
    return board;
}
export const board = getObj();