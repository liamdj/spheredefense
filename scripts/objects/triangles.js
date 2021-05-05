// DEMO triangles

export const createTriangles = () => {
    const triangles = {};
    const geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        flatShading: true,
    });
    const mesh = new THREE.Group();
    const spaceRadius = settings.WORLD_RADIUS * 3;
    for (let i = 0; i < 500; i++) {
        const triangleMesh = new THREE.Mesh(geometry, material);
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.random() * 2 * Math.PI;
        const rho = spaceRadius + Math.random() * 100;
        triangleMesh.position.x = rho * Math.cos(theta) * Math.sin(phi);
        triangleMesh.position.y = rho * Math.sin(theta) * Math.sin(phi);
        triangleMesh.position.z = rho * Math.cos(phi);
        triangleMesh.updateMatrix();
        const [xspeed, yspeed, zspeed] = [
            Math.random(),
            Math.random(),
            Math.random(),
        ];
        triangleMesh.timeStep = (time) => {
            triangleMesh.rotation.x = time * xspeed;
            triangleMesh.rotation.y = time * yspeed;
            triangleMesh.rotation.z = time * zspeed;
        };
        mesh.add(triangleMesh);
    }
    triangles.mesh = mesh;
    triangles.timeStep = (time) => { triangles.mesh.children.forEach((child) => child.timeStep(time)) };
    return triangles;
};
