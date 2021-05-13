export class Bullet {
  static geometry = new THREE.BoxGeometry(2, 2, 3);
  static material = new THREE.MeshLambertMaterial({ emissive: 0xffff00 });
  static speed = 18000;

  constructor(startPosition, direction) {
    this.lastTime = null;
    this.mesh = new THREE.Group();

    for (let i = 0; i < 15; i++) {
      const mesh = new THREE.Mesh(Bullet.geometry, Bullet.material);
      mesh.position.setZ(6 * i);
      mesh.scale.multiplyScalar(1 - i / 15);
      this.mesh.add(mesh);
    }
    this.direction = direction.clone().normalize();
    this.mesh.position.copy(startPosition);
    this.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), this.direction);
    this.mesh.position.addScaledVector(this.direction, 100);
  }

  timeStep = (time) => {
    if (this.lastTime != null) {
      this.mesh.position.addScaledVector(
        this.direction,
        Bullet.speed * (time - this.lastTime)
      );
    }
    this.lastTime = time;
  };

  get isGone() {
    const lenSq = this.mesh.position.lengthSq();
    const radiusSq = settings.WORLD_RADIUS * settings.WORLD_RADIUS;
    return lenSq < 0.9 * radiusSq || lenSq > 1000 * radiusSq;
  }
}
