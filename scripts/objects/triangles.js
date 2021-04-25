// DEMO triangles

let getObj = () => {
  const geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    flatShading: true,
  });
  const triangles = [];
  const spaceRadius = settings.WORLD_RADIUS * 2;
  for (let i = 0; i < 500; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.random() * 2 * Math.PI;
    const rho = spaceRadius + Math.random() * 100;
    mesh.position.x = rho * Math.cos(theta) * Math.sin(phi);
    mesh.position.y = rho * Math.sin(theta) * Math.sin(phi);
    mesh.position.z = rho * Math.cos(phi);
    mesh.updateMatrix();
    const [xspeed, yspeed, zspeed] = [
      Math.random(),
      Math.random(),
      Math.random(),
    ];
    mesh.timeStep = (time) => {
      mesh.rotation.x = time * xspeed;
      mesh.rotation.y = time * yspeed;
      mesh.rotation.z = time * zspeed;
    };
    triangles.push(mesh);
  }
  return triangles;
};

export const triangles = getObj();
