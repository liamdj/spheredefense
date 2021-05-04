// Tile highlights on selection
export class HoverLines {
  constructor() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
    );
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
    });

    this.mesh = new THREE.Line(geometry, material);
  }
  timeStep = (time) => {};
}

export class SelectFace {
  constructor() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
    );
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
    });
    this.mesh = new THREE.Mesh(geometry, material);
  }
  timeStep = (time) => {};
}
