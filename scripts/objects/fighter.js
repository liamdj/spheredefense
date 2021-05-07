import { Bullet } from "./bullets.js";

export class Fighter {
  constructor(aspect, position) {
    const initialPosition = new THREE.Vector3(
      position.x,
      position.y,
      position.z
    );
    const viewDirection = new THREE.Vector3(0, 0, -1);

    this.angularVel = new THREE.Vector3();
    this.speed = 2;
    this.moving = true;

    // object exists in world coordinates (center at orign)
    this.mesh = new THREE.Object3D();

    // group exists in local coordinates
    this.group = new THREE.Group();
    this.group.position.copy(initialPosition);
    this.group.rotation.set(0, 0, Math.PI, "ZYX");
    // group.castShadow = true;

    const bodyGeo = new THREE.BoxGeometry(2, 2, 6);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xadc6f0 });
    const bodyLeft = new THREE.Mesh(bodyGeo, bodyMat);
    const bodyRight = new THREE.Mesh(bodyGeo, bodyMat);
    bodyLeft.position.set(4, -4, -7);
    bodyRight.position.set(-4, -4, -7);
    this.group.add(bodyLeft);
    this.group.add(bodyRight);

    const noseGeo = new THREE.BoxGeometry(3, 3, 1);
    const noseMat = new THREE.MeshPhongMaterial({ color: 0xadc6f0 });
    const noseRight = new THREE.Mesh(noseGeo, noseMat);
    noseRight.position.set(4, -4, -10);
    const noseLeft = new THREE.Mesh(noseGeo, noseMat);
    noseLeft.position.set(-4, -4, -10);
    this.group.add(noseRight);
    this.group.add(noseLeft);

    this.camera = new THREE.PerspectiveCamera(80, aspect, 1, 1200);
    this.camera.lookAt(viewDirection);
    // camera.updateProjectionMatrix();
    this.group.add(this.camera);

    this.mesh.add(this.group);
  }

  updateVelocity = (x, y) => {
    this.angularVel.set(y, x, 0);
    // angularVel.clampScalar(-0.5, 0.5);
    // const screenVel = new THREE.Vector2(x, y);
    // screenVel.clampLength(0, 0.1);
    // const forwardSpeed = Math.sqrt(1 - screenVel.lengthSq());
  };

  pause = () => {
    this.speed = 0;
    this.moving = false;
  };

  resume = () => {
    this.speed = 2;
    this.moving = true;
  };

  // this must be the longest I've ever spent on 15 lines of code
  timeStep = (time) => {
    const nextLocalRotation = this.group.rotation
      .toVector3()
      .addScaledVector(this.angularVel, 0.01);
    // cannot rotate through poles
    nextLocalRotation.setX(
      Math.max(-Math.PI / 2, Math.min(Math.PI / 2, nextLocalRotation.x))
    );
    // roll scales with change in yaw
    nextLocalRotation.setZ(0.2 * this.angularVel.y);
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
    // camera.updateProjectionMatrix();
  };

  fireBullets = (intersectPoint) => {
    const leftOffset = this.group.localToWorld(new THREE.Vector3(-4, -4, -12));
    const rightOffset = this.group.localToWorld(new THREE.Vector3(4, -4, -12));
    let leftBullet, rightBullet;
    if (intersectPoint) {
      // adjust bullet direction toward target
      leftBullet = new Bullet(
        leftOffset,
        new THREE.Vector3(-2, -2, 0).add(intersectPoint)
      );
      rightBullet = new Bullet(
        rightOffset,
        new THREE.Vector3(2, -2, 0).add(intersectPoint)
      );
    } else {
      // fire straight ahead
      const leftOffset2 = this.group.localToWorld(
        new THREE.Vector3(-4, -4, -24)
      );
      const rightOffset2 = this.group.localToWorld(
        new THREE.Vector3(4, -4, -24)
      );
      leftBullet = new Bullet(leftOffset, leftOffset2);
      rightBullet = new Bullet(rightOffset, rightOffset2);
    }
    return [leftBullet, rightBullet];
  };
}
