export class Bullet {
  static geometry = new THREE.BoxGeometry(1, 1, 2);
  static material = new THREE.MeshLambertMaterial({ emissive: 0xffff00 });

  constructor(startPosition, targetPosition) {
    this.lastTime = null;
    this.mesh = new THREE.Mesh(Bullet.geometry, Bullet.material);
    this.mesh.position.copy(startPosition);
    this.direction = new THREE.Vector3()
      .subVectors(targetPosition, startPosition)
      .normalize();
  }

  timeStep = (time) => {
    if (this.lastTime != null)
      this.mesh.position.addScaledVector(
        this.direction,
        35000 * (time - this.lastTime)
      );
    this.lastTime = time;
  };

  get isGone() {
    const lenSq = this.mesh.position.lengthSq();
    const radiusSq = settings.WORLD_RADIUS * settings.WORLD_RADIUS;
    return lenSq < 0.9 * radiusSq || lenSq > 100 * radiusSq;
  }
}
