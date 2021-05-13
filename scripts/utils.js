import { Explosion } from "./objects/particles.js";
import { Troop } from "./objects/troops.js";

const effects = [];

export const handleCollisions = (
  objects,
  scene,
  time,
  blobMeshes,
  idToEntity
) => {
  objects.forEach((object, index) => {
    if (object.type) {
      // turrets shoot at something in range
      if (object.type == "TURRET") {
        let target = null;
        let targetDist = object.range;
        blobMeshes.forEach((mesh) => {
          const dist = object.mesh.position.distanceTo(mesh.position);
          if (dist < targetDist) {
            target = mesh;
            targetDist = dist;
          }
        });
        if (target != null) {
          const bullet = object.attemptFireBullet(target.position, time);
          if (bullet) {
            objects.push(bullet);
            scene.add(bullet.mesh);
            const blob = idToEntity.get(target.id);
            blob.health -= object.damage;
          }
        }
      }
    }

    // tower takes damage from all nearby troops
    if (object.type == "TOWER") {
      blobMeshes.forEach((mesh) => {
        const blob = idToEntity.get(mesh.id);
        if (object.mesh.position.distanceTo(mesh.position) < blob.range) {
          object.health -= blob.damage;
        }
      });
    }

    // remove any objects with no health or too far away
    if (object.isGone) {
      scene.remove(object.mesh);
      objects.splice(index, 1);
      // if we removed the tower, game over
      if (object.type == "TOWER") {
        objects.forEach((obj) => {
          scene.remove(obj);
        });
        alert("Game Over...");
        stats.gameover = true;
      }
      // if we remove a troop, increment score and add visual effect
      if (object.type == "TROOP") {
        blobMeshes.splice(
          blobMeshes.findIndex((e) => e.id == object.mesh.id),
          1
        );
        stats.score += 1;
        Troop.deathSound.play();
        document.getElementById("score").innerHTML = stats.score;
        const pos = object.mesh.position;
        const explosion = new Explosion(pos, pos.clone().normalize(), time, true);
        objects.push(explosion);
        scene.add(explosion.mesh);
      }
    }
  });
};
