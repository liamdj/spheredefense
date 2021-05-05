var gui = new dat.GUI();

var options = {
  velx: 0,
  vely: 0,
  camera: {
    speed: 0.0001,
  },
  stop: function () {
    this.velx = 0;
    this.vely = 0;
  },
  reset: function () {
    this.velx = 0.1;
    this.vely = 0.1;
    camera.position.z = 75;
    camera.position.x = 0;
    camera.position.y = 0;
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
  .max(2)
  .step(0.1)
  .name("Turret Damage")
  .listen();
