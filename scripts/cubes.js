// DEMO cubes

const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
const redMat = new THREE.MeshPhongMaterial({ color: 0xdd2244 });
const c1 = new THREE.Mesh(cubeGeo, redMat);
const c2 = new THREE.Mesh(cubeGeo, redMat);
c1.position.set(-2, 0, -5);
c2.position.set(+2, 0, -5);
c1.update = (time) => {
  const speed = 1 + 0 * 0.1;
  const rot = time * speed;
  c1.rotation.x = rot;
  c1.rotation.y = rot;
};
c2.update = (time) => {
  const speed = 1 + 1 * 0.1;
  const rot = time * speed;
  c2.rotation.x = rot;
  c2.rotation.y = rot;
};
export const cubes = [c1, c2];
