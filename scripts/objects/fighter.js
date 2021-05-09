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
    // includes plane and camera
    this.group = new THREE.Group();
    this.group.position.copy(initialPosition);
    this.group.rotation.set(0, 0, 0, "ZYX");
    // group.castShadow = true;

    // plane can roll while camera stays fixed
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
    const addObj = (obj) => this.planeMesh.add(obj);

    // plane obj import
    const loader = new THREE.OBJLoader();
    loader.load(
      // resource URL
      `${siteurl}/obj/plane.obj`,
      // called when resource is loaded
      function (object) {
        object.rotateX((-1 * Math.PI) / 2);
        object.position.add(new THREE.Vector3(0, -3, -3));
        addObj(object);
      },
      // called when loading is in progresses
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // called when loading has errors
      function (error) {
        console.log("An error occured while loading");
      }
    );

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
    const leftStart = this.planeMesh.localToWorld(
      new THREE.Vector3(-4, -4, -10)
    );
    const rightStart = this.planeMesh.localToWorld(
      new THREE.Vector3(4, -4, -10)
    );
    let leftBullet, rightBullet;
    if (intersectPoint) {
      // adjust bullet direction toward target
      const leftDirection = this.planeMesh
        .localToWorld(
          this.planeMesh
            .worldToLocal(intersectPoint.clone())
            .add(new THREE.Vector3(-2, -2, 0))
        )
        .sub(leftStart);
      leftBullet = new Bullet(leftStart, leftDirection);
      const rightDirection = this.planeMesh
        .localToWorld(
          this.planeMesh
            .worldToLocal(intersectPoint.clone())
            .add(new THREE.Vector3(2, -2, 0))
        )
        .sub(rightStart);
      rightBullet = new Bullet(rightStart, rightDirection);
    } else {
      // fire straight ahead
      const straight = this.planeMesh
        .localToWorld(new THREE.Vector3(0, 0, -1))
        .sub(this.planeMesh.getWorldPosition(new THREE.Vector3()));
      leftBullet = new Bullet(leftStart, straight);
      rightBullet = new Bullet(rightStart, straight);
    }
    return [leftBullet, rightBullet];
  };
}
