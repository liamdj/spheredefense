var gui = new dat.GUI();

var options = {
  togglePhase: function () {
    stats.phase = stats.phase == "build" ? "flight" : "build";
  },
};

gui
  .add(settings, "SPAWN_FREQUENCY")
  .min(0)
  .max(1)
  .step(0.001)
  .name("Spawn Rate")
  .listen();
gui
  .add(settings, "MAX_TURRETS")
  .min(0)
  .max(20)
  .step(1)
  .name("Max Turrets")
  .listen();
gui
  .add(settings, "ENEMY_SPEED")
  .min(0)
  .max(10)
  .step(0.05)
  .name("Enemy Speed")
  .listen();
gui
  .add(settings, "TURRET_RANGE")
  .min(0)
  .max(200)
  .step(1)
  .name("Turret Range")
  .listen();
gui
  .add(settings, "TURRET_DAMAGE")
  .min(0)
  .max(10)
  .step(0.1)
  .name("Turret Damage")
  .listen();
gui.add(options, "togglePhase").name("Toggle Phase");
