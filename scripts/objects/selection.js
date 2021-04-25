// Tile highlights on selection

let getObj = () => {
  let geometry, material;

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
  );
  material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
  });
  const hoverLine = new THREE.Line(geometry, material);
  hoverLine.timeStep = (time) => {};

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
  );
  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
  });
  const selectFace = new THREE.Mesh(geometry, material);
  selectFace.timeStep = (time) => {};

  return [hoverLine, selectFace];
};
export const selectionLines = getObj();
