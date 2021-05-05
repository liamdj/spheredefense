export const createPlanet = () => {

    const planetGeo = new THREE.IcosahedronGeometry(settings.WORLD_RADIUS, 2);
    const planetMat = new THREE.MeshLambertMaterial({ color: 0x14926a });
    const mesh = new THREE.Mesh(planetGeo, planetMat);

    const timeStep = (time) => { };

    return { mesh, timeStep };
}