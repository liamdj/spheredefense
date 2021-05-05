import { Troop } from "./objects/troops.js";
export const checkNewEnemy = (time, tiles) => {
    const frequency = settings.SPAWN_FREQUENCY;
    if (Math.random() < frequency) {
        return new Troop(tiles[parseInt(Math.random() * tiles.length)], time);
    }
};
