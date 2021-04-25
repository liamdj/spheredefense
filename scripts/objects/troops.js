let getObj = () => {
  const standardgeometry = new THREE.SphereGeometry(10);
  const team1material = new THREE.MeshBasicMaterial({
    color: settings.TEAM_1_COLOR,
  });
  const team2material = new THREE.MeshBasicMaterial({
    color: settings.TEAM_2_COLOR,
  });

  const sphereToCart = (rho, theta, phi) => [
    rho * Math.cos(theta) * Math.sin(phi),
    rho * Math.sin(theta) * Math.sin(phi),
    rho * Math.cos(phi),
  ];
  const rotateYZ = (point, angle) => {
    const r = Math.sqrt(Math.pow(point[1], 2) + Math.pow(point[2], 2));
    return [point[0], r * Math.cos(angle), r * Math.sin(angle)];
  };

  const troopArr = [];

  for (let i = 0; i < 7; i++) {
    // choose team randomly
    const team = Math.random() < 0.5 ? 1 : 2;
    const troop = new THREE.Mesh(
      standardgeometry,
      team == 1 ? team1material : team2material
    );

    // set initial spherical coordinates
    troop.sphericalCoords = {
      rho: settings.WORLD_RADIUS + 5,
      theta: team == 1 ? Math.PI : 0,
      phi: Math.PI / 2,
    };
    const offsetAngle = Math.PI * 2 * Math.random();
    const coords = sphereToCart(
      troop.sphericalCoords.rho,
      troop.sphericalCoords.theta,
      troop.sphericalCoords.phi
    );
    const rotatedCoords = rotateYZ(coords, offsetAngle);
    troop.position.set(rotatedCoords[0], rotatedCoords[1], rotatedCoords[2]);

    // animate spherical movement
    const speed = 0.01;
    const direction = team == 1 ? -1 : 1;
    troop.timeStep = (time) => {
      let newTheta = troop.sphericalCoords.theta + speed * direction;
      if (newTheta > Math.PI) newTheta = 0;
      if (newTheta < 0) newTheta = Math.PI;
      troop.sphericalCoords = {
        rho: settings.WORLD_RADIUS + 5,
        theta: newTheta,
        phi: troop.sphericalCoords.phi,
      };

      const coords = sphereToCart(
        troop.sphericalCoords.rho,
        troop.sphericalCoords.theta,
        troop.sphericalCoords.phi
      );
      const rotatedCoords = rotateYZ(coords, offsetAngle);
      troop.position.set(rotatedCoords[0], rotatedCoords[1], rotatedCoords[2]);
    };

    troopArr.push(troop);
  }

  return troopArr;
};
export const troops = getObj();
