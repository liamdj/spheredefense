// DEMO triangles
class Triangle {
  constructor() {
    const geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
    });
    const spaceRadius = settings.WORLD_RADIUS * 2;
    this.mesh = new THREE.Mesh(geometry, material);
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.random() * 2 * Math.PI;
    const rho = spaceRadius + Math.random() * 100;
    this.mesh.position.x = rho * Math.cos(theta) * Math.sin(phi);
    this.mesh.position.y = rho * Math.sin(theta) * Math.sin(phi);
    this.mesh.position.z = rho * Math.cos(phi);
    this.mesh.updateMatrix();
    this.xspeed = Math.random();
    this.yspeed = Math.random();
    this.zspeed = Math.random();
  }
  timeStep = (time) => {
    this.mesh.rotation.x = time * this.xspeed;
    this.mesh.rotation.y = time * this.yspeed;
    this.mesh.rotation.z = time * this.zspeed;
  };
}

export const triangles = {};
const triangleArr = [];
const mesh = new THREE.Group();
for (let i = 0; i < 500; i++) {
  const triangle = new Triangle();
  triangleArr.push(triangle);
  mesh.add(triangle.mesh);
}
triangles.mesh = mesh;
triangles.timeStep = (time) => {
  triangleArr.forEach((child) => child.timeStep(time));
};
