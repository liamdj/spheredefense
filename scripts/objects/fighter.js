import { Bullet } from "./bullets.js";
import { Crosshairs } from "./Crosshairs.js";

export class Fighter {
  static minSpeed = 1;
  static maxSpeed = 3;
  static acceleration = 0.05;
  static deceleration = 0.1;
  static damage = 75;
  static planeModel = new THREE.Object3D();
  static shootSound = new THREE.Audio(new THREE.AudioListener());

  constructor(aspect) {
    const initialPosition = new THREE.Vector3(
      0,
      1.5 * settings.WORLD_RADIUS,
      0
    );
    const viewDirection = new THREE.Vector3(0, 0, -1);

    this.angularVel = new THREE.Vector3();
    this.speed = 0.5;
    this.breaking = true;

    // object exists in world coordinates (center at orign)
    this.mesh = new THREE.Object3D();

    // group exists in local coordinates
    // includes plane and camera
    this.group = new THREE.Group();
    this.group.position.copy(initialPosition);
    this.group.rotation.set(0, 0, 0, "ZYX");
    // group.castShadow = true;

    // plane can roll while camera stays fixed
    this.planeMesh = new THREE.Group();
    this.planeMesh.position.set(0, -2, 0);
    this.planeMesh.add(Fighter.planeModel);

    this.camera = new THREE.PerspectiveCamera(80, aspect, 1, 1200);
    this.camera.lookAt(viewDirection);
    this.group.add(this.camera);

    this.crosshairs = new Crosshairs();
    this.group.add(this.crosshairs.sprite);

    this.group.add(this.planeMesh);
    this.mesh.add(this.group);
  }

  updateVelocity = (screenVec) => {
    screenVec.multiplyScalar(Math.PI / 100);
    this.angularVel.set(2.5 * screenVec.y, -1 * screenVec.x, 0);
  };

  // this must be the longest I've ever spent on 15 lines of code
  timeStep = (time) => {
    if (this.breaking) {
      this.speed -= Fighter.deceleration;
      this.speed = Math.max(Fighter.minSpeed, this.speed);
    } else {
      this.speed += Fighter.acceleration;
      this.speed = Math.min(Fighter.maxSpeed, this.speed);
    }

    const nextLocalRotation = this.group.rotation
      .toVector3()
      .add(this.angularVel);
    // cannot rotate through poles
    nextLocalRotation.setX(
      Math.max(-Math.PI / 2, Math.min(Math.PI / 2, nextLocalRotation.x))
    );
    // roll scales with change in yaw
    this.planeMesh.rotation.set(0, 0, 8 * this.angularVel.y);
    this.group.rotation.setFromVector3(nextLocalRotation);

    const worldVelocity = new THREE.Vector3(0, 0, -this.speed)
      .applyQuaternion(this.group.quaternion)
      .applyQuaternion(this.mesh.quaternion);
    const worldPosition = this.group.getWorldPosition(new THREE.Vector3());
    const nextWorldPosition = new THREE.Vector3().addVectors(
      worldPosition,
      worldVelocity
    );
    // must use mesh, not group
    const localPosition = this.mesh.worldToLocal(nextWorldPosition.clone());

    // in local coords, only plane height changes
    this.group.position.setY(localPosition.y);
    // rotation accounts for change in global position
    const worldRotationDelta = new THREE.Quaternion().setFromUnitVectors(
      worldPosition.normalize(),
      nextWorldPosition.normalize()
    );
    this.mesh.applyQuaternion(worldRotationDelta);
    // if too close to land, force above land
    this.group.position.clampLength(
      1.1 * settings.WORLD_RADIUS,
      30 * settings.WORLD_RADIUS
    );
  };

  fireBulletsAt = (intersectPoint) => {
    const leftStart = this.planeMesh.localToWorld(
      new THREE.Vector3(-8, -4, -12)
    );
    const rightStart = this.planeMesh.localToWorld(
      new THREE.Vector3(8, -4, -12)
    );
    // adjust bullet direction toward target
    const leftDirection = this.planeMesh
      .localToWorld(
        this.planeMesh
          .worldToLocal(intersectPoint.clone())
          .add(new THREE.Vector3(-4, -2, 0))
      )
      .sub(leftStart);
    const leftBullet = new Bullet(leftStart, leftDirection);
    const rightDirection = this.planeMesh
      .localToWorld(
        this.planeMesh
          .worldToLocal(intersectPoint.clone())
          .add(new THREE.Vector3(4, -2, 0))
      )
      .sub(rightStart);
    const rightBullet = new Bullet(rightStart, rightDirection);
    return [leftBullet, rightBullet];
  };

  fireBulletsDirection = (direction) => {
    const leftStart = this.planeMesh.localToWorld(
      new THREE.Vector3(-8, -4, -12)
    );
    const rightStart = this.planeMesh.localToWorld(
      new THREE.Vector3(8, -4, -12)
    );
    // fire straight in direction
    const adjusted = this.planeMesh
      .localToWorld(direction)
      .sub(this.planeMesh.getWorldPosition(new THREE.Vector3()));
    const leftBullet = new Bullet(leftStart, adjusted);
    const rightBullet = new Bullet(rightStart, adjusted);
    return [leftBullet, rightBullet];
  };
}
