export class Troop {

    static geometry = new THREE.SphereGeometry(10);
    static material = new THREE.MeshBasicMaterial({
        color: settings.TEAM_2_COLOR,
    });
    static timeOfHop = 0.0001 * 800;
    static timeBetweenHops = 0.0001 * 4000;

    constructor(tile, time) {

        this.mesh = new THREE.Mesh(Troop.geometry, Troop.material);

        // set initial tile coordinates
        this.tile = tile;
        this.mesh.position.addScaledVector(tile.centroid, 1.025);
        this.hopping = false;
        this.waitTimeStart = time;

        this.speed = 1;
        this.health = 100;
        this.maxHealth = 100;
        this.type = "TROOP";
        this.range = 10;
        this.damage = 10;
    }

    // animate tile to tile movement
    timeStep = (time) => {
        if (this.hopping) {
            // move towards its tile
            const t = Math.min((time - this.hopStartTime) * this.speed / Troop.timeOfHop, 1);
            const s = (1 + (4 * (t - 0.5) * Math.abs(t - 0.5))) / 2;
            this.curve.getPointAt(s, this.mesh.position);
            if (t >= 1) {
                this.hopping = false;
                this.waitTimeStart = time;
            }
        } else if ((time - this.waitTimeStart) * this.speed >= Troop.timeBetweenHops) {
            // find the tile closest to the tower
            let closestTile = this.tile.adjacents[0];
            this.tile.adjacents.forEach((adjacentTile) => {
                if (adjacentTile.distanceFromOrigin < closestTile.distanceFromOrigin) {
                    closestTile = adjacentTile;
                }
            });
            this.tile = closestTile;
            // produce new curve
            const endpoint = new THREE.Vector3().addScaledVector(closestTile.centroid, 1.025);
            const midpoint1 = new THREE.Vector3().addScaledVector(this.mesh.position, 0.7).addScaledVector(endpoint, 0.4);
            const midpoint2 = new THREE.Vector3().addScaledVector(this.mesh.position, 0.4).addScaledVector(endpoint, 0.7);
            this.curve = new THREE.CatmullRomCurve3([this.mesh.position, midpoint1, midpoint2, endpoint], 'chordal');
            this.hopStartTime = time;
            this.hopping = true;
        }
    };
}
