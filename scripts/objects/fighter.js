import { Bullet } from "./bullets.js";

export class Fighter {
  constructor(aspect) {
    const initialPosition = new THREE.Vector3(
      0,
      1.5 * settings.WORLD_RADIUS,
      0
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
    this.group.rotation.set(0, 0, 0, "ZYX");
    // group.castShadow = true;

    this.planeMesh = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(2, 2, 6);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xadc6f0 });
    const bodyLeft = new THREE.Mesh(bodyGeo, bodyMat);
    const bodyRight = new THREE.Mesh(bodyGeo, bodyMat);
    bodyLeft.position.set(4, -4, -7);
    bodyRight.position.set(-4, -4, -7);
    this.planeMesh.add(bodyLeft);
    this.planeMesh.add(bodyRight);

    const noseGeo = new THREE.BoxGeometry(3, 3, 1);
    const noseMat = new THREE.MeshPhongMaterial({ color: 0xadc6f0 });
    const noseRight = new THREE.Mesh(noseGeo, noseMat);
    noseRight.position.set(4, -4, -10);
    const noseLeft = new THREE.Mesh(noseGeo, noseMat);
    noseLeft.position.set(-4, -4, -10);
    this.planeMesh.add(noseRight);
    this.planeMesh.add(noseLeft);

    this.camera = new THREE.PerspectiveCamera(80, aspect, 1, 1200);
    this.camera.lookAt(viewDirection);
    // camera.updateProjectionMatrix();
    this.group.add(this.camera);

    this.group.add(this.planeMesh);
    this.mesh.add(this.group);
  }

  updateVelocity = (screenVec) => {
    const len = screenVec.length() - 0.25;
    if (len < 0) {
      this.angularVel.set(0, 0, 0);
    } else {
      screenVec.multiplyScalar((Math.PI * len) / 100);
      this.angularVel.set(2 * screenVec.y, -1 * screenVec.x, 0);
    }
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
      .add(this.angularVel);
    // cannot rotate through poles
    nextLocalRotation.setX(
      Math.max(-Math.PI / 2, Math.min(Math.PI / 2, nextLocalRotation.x))
    );
    // roll scales with change in yaw
    this.planeMesh.rotation.set(0, 0, 10 * this.angularVel.y);
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
      settings.WORLD_RADIUS,
      50 * settings.WORLD_RADIUS
    );
    // if (this.group.position.length() < settings.WORLD_RADIUS) {
    //     const newVect = this.group.position.clone();
    //     newVect.normalize();
    //     this.group.position.multiplyScalar(0);
    //     this.group.position.addScaledVector(newVect, settings.WORLD_RADIUS);
    //     console.log('bump')
    // }

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
