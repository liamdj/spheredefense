export class Star {
  static starModel = new THREE.Object3D();
  constructor() {
    const spaceRadius = settings.WORLD_RADIUS * 3;
    this.mesh = new THREE.Object3D();

    this.mesh = new THREE.Object3D();
    this.group = new THREE.Group();
    this.group.add(Star.starModel.clone());
    this.group.scale.multiplyScalar(3);
    this.mesh.add(this.group);

    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.random() * 2 * Math.PI;
    const rho = spaceRadius + Math.random() * 100;
    this.mesh.position.x = rho * Math.cos(theta) * Math.sin(phi);
    this.mesh.position.y = rho * Math.sin(theta) * Math.sin(phi);
    this.mesh.position.z = rho * Math.cos(phi);
    this.mesh.updateMatrix();
    this.xspeed = 6 * Math.random();
    this.yspeed = 6 * Math.random();
    this.zspeed = 6 * Math.random();
  }
  timeStep = (time) => {
    this.mesh.rotation.x = time * this.xspeed;
    this.mesh.rotation.y = time * this.yspeed;
    this.mesh.rotation.z = time * this.zspeed;
  };
}
