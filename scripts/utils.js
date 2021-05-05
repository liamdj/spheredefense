import { Explosion } from "./objects/particles.js";

const effects = [];

export const handleCollisions = (objects, scene, score, time) => {
  const dist = (pos1, pos2) =>
    Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2) +
        Math.pow(pos1.z - pos2.z, 2)
    );
  objects.forEach((object, index) => {
    if (object.type) {
      // turrets shoot at all things in range
      if (object.type == "TURRET") {
        objects.forEach((oobject) => {
          if (
            oobject.type &&
            oobject.type == "TROOP" &&
            dist(object.mesh.position, oobject.mesh.position) < object.range
          ) {
            oobject.health -= object.damage;
            const shrinkFactor = 1 - object.damage / oobject.maxHealth;
            oobject.mesh.geometry.scale(
              shrinkFactor,
              shrinkFactor,
              shrinkFactor
            );
          }
        });
      }

      // tower takes damage from all nearby troops
      if (object.type == "TOWER") {
        objects.forEach((oobject) => {
          if (
            oobject.type &&
            oobject.type == "TROOP" &&
            dist(object.mesh.position, oobject.mesh.position) < oobject.range
          ) {
            object.health -= oobject.damage;
          }
        });
      }

      // remove any objects with no health
      if (object.health && object.health <= 0) {
        scene.remove(object.mesh);
        objects.splice(index, 1);
        // if we removed the tower, game over
        if (object.type == "TOWER") {
          objects.forEach((obj) => {
            scene.remove(obj);
          });
          alert("Game Over...");
          // stats.gameover = true;
        }
        // if we remove a troop, increment score and add visual effect
        if (object.type == "TROOP") {
          stats.score += 1;
          document.getElementById("score").innerHTML = stats.score;
          const explosion = new Explosion(object.mesh.position, time);
          objects.push(explosion);
          scene.add(explosion.mesh);
        }
      }
    }
  });
};
