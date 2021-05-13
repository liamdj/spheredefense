class Particle {
  static geometryS = new THREE.TetrahedronGeometry(3, 0);
  static geometryL = new THREE.TetrahedronGeometry(5, 0);
  static material = new THREE.MeshLambertMaterial({
    color: settings.TEAM_2_COLOR,
  });

  constructor(time, normal, large) {
    this.mesh = large ? new THREE.Mesh(Particle.geometryL, Particle.material) : new THREE.Mesh(Particle.geometryS, Particle.material);
    this.startTime = time;
    this.endTime = time + 0.0001 * 1000 * (1 + Math.random());
    this.direction = new THREE.Vector3().random().add(normal).normalize();
    this.speed = (large ? 45 : 30) * (2 + Math.random());
  }

  timeStep = (time) => {
    const youth = (this.endTime - time) / (this.endTime - this.startTime);
    this.mesh.position.addScaledVector(
      this.direction,
      youth * youth * this.speed * (time - this.startTime)
    );
    this.mesh.scale.set(youth, youth, youth);
  };
}

export class Explosion {
  constructor(position, normal, time, large) {
    this.particles = [];
    this.mesh = new THREE.Group();
    this.mesh.position.copy(position);
    const num = large ? 20 : 10;
    for (let i = 0; i < num; i++) {
      const particle = new Particle(time, normal, large);
      this.particles.push(particle);
      this.mesh.add(particle.mesh);
    }
  }

  get isGone() {
    return this.particles.length == 0;
  }

  timeStep = (time) => {
    this.particles.forEach((p, index) => {
      if (time >= p.endTime) {
        p.visible = false;
        this.particles.splice(index, 1);
      } else {
        p.timeStep(time);
      }
    });
  };
}
