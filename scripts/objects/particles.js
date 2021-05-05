class Particle {

    static geometry = new THREE.TetrahedronGeometry(3, 0);
    static material = new THREE.MeshLambertMaterial({
        color: settings.TEAM_2_COLOR
    });

    constructor(time, normal) {
        this.mesh = new THREE.Mesh(Particle.geometry, Particle.material);
        this.startTime = time;
        this.endTime = time + 0.0001 * 1200 * (1 + Math.random());
        this.direction = new THREE.Vector3().random().add(normal).normalize();
        this.mesh.position.addScaledVector(this.direction, 5);
        this.speed = 15 * (1.5 + Math.random());
    }

    timeStep = (time) => {
        const youth = (this.endTime - time) / (this.endTime - this.startTime);
        this.mesh.position.addScaledVector(this.direction, (0.5 + youth) * youth * this.speed * (time - this.startTime));
        this.mesh.scale.set(youth, youth, youth);
    }
}

export class Explosion {
    constructor(position, time) {
        this.particles = [];
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);
        const normal = position.clone().normalize();
        for (let i = 0; i < 10; i++) {
            const particle = new Particle(time, normal);
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
    }
}