import { troop } from "./objects/troops.js";
export const handleEnemyBehavior = (time, tiles, scene, objects) => {
  const frequency = settings.SPAWN_FREQUENCY;
  if (Math.random() < frequency) {
    const newTroop = troop(tiles[parseInt(Math.random() * tiles.length)]);
    scene.add(newTroop);
    objects.push(newTroop);
  }
};
