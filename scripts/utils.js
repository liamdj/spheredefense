import { Explosion } from "./objects/particles.js";
import { Troop } from "./objects/troops.js";

export const handleCollisions = (
  objects,
  scene,
  time,
  blobSpheres,
  idToBlob
) => {
  objects.forEach((object, index) => {
    if (object.type) {
      // turrets shoot at something in range
      if (object.type == "TURRET") {
        let target = null;
        let targetDist = object.range;
        blobSpheres.forEach((sphere) => {
          const dist = object.mesh.position.distanceTo(sphere.getWorldPosition(new THREE.Vector3()));
          if (dist < targetDist) {
            target = sphere;
            targetDist = dist;
          }
          if (dist < Troop.range) {
            object.dead = true;
          }
        });
        if (target != null) {
          const pos = target.getWorldPosition(new THREE.Vector3());
          const bullet = object.attemptFireBullet(pos, time);
          if (bullet) {
            objects.push(bullet);
            scene.add(bullet.mesh);
            const explosion = new Explosion(pos, pos.clone().normalize(), time, false);
            objects.push(explosion);
            scene.add(explosion.mesh);
            const blob = idToBlob.get(target.id);
            blob.health -= object.damage;
          }
        }
      }
    }

    // loses a life for each blob at tower
    if (object.type == "TOWER") {
      blobSpheres.forEach((sphere) => {
        const blob = idToBlob.get(sphere.id);
        if (object.mesh.position.distanceTo(sphere.getWorldPosition(new THREE.Vector3())) < Troop.range) {
          stats.lives--;
          document.getElementById("lives").innerHTML = stats.lives;
          blob.health = -1;
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
        stats.gameover = true;
        alert("Game Over...");
      }
      // if we remove a troop, increment score and add visual effect
      if (object.type == "TROOP") {
        blobSpheres.splice(
          blobSpheres.findIndex((e) => e.id == object.sphere.id),
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
