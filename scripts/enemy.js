import { Troop } from "./objects/troops.js";
export const checkNewEnemy = (time, tiles) => {
    const frequency = settings.SPAWN_FREQUENCY;
    if (Math.random() < frequency) {
        return new Troop(tiles[parseInt(Math.random() * tiles.length)], time);
    }
  }
export const handleEnemyBehavior = (time, tiles, scene, objects) => {
  const frequency = settings.SPAWN_FREQUENCY;
  if (Math.random() < frequency) {
    const newTroop = new Troop(
      tiles[parseInt(Math.random() * tiles.length)],
      time
    );
    scene.add(newTroop.mesh);
    objects.push(newTroop);
  }
};
