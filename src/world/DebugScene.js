import * as THREE from 'three';
import { config } from '../config.js';

/**
 * DebugScene - TEMPORARY reference scene: ground grid plus a spinning cube.
 * It is removed entirely in phase 2 (sky).
 * Its only purpose is to confirm by eye that the render loop, delta time
 * and the measurement overlay all behave correctly.
 */
export class DebugScene {
  /** @param {THREE.Scene} scene */
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'DebugScene';
    scene.add(this.group);

    const g = config.debug.grid;
    this.grid = new THREE.GridHelper(g.size, g.divisions, g.colorCenter, g.colorGrid);
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.35;
    this.group.add(this.grid);

    const c = config.debug.cube;
    this.cubeGeometry = new THREE.BoxGeometry(c.size, c.size, c.size);
    this.cubeMaterial = new THREE.MeshStandardMaterial({
      color: c.color,
      emissive: c.emissive,
      emissiveIntensity: c.emissiveIntensity,
      roughness: 0.35,
      metalness: 0.1,
    });
    this.cube = new THREE.Mesh(this.cubeGeometry, this.cubeMaterial);
    this.cube.position.set(c.position.x, c.position.y, c.position.z);
    this.group.add(this.cube);

    // Two simple lights so the cube faces stay readable
    this.hemiLight = new THREE.HemisphereLight(0x4466ff, 0x120a33, 1.2);
    this.keyLight = new THREE.PointLight(0xff2fd0, 40, 60, 2);
    this.keyLight.position.set(4, 6, 4);
    this.group.add(this.hemiLight, this.keyLight);
  }

  /** @param {number} dt */
  update(dt) {
    const s = config.debug.cube.spinSpeed;
    this.cube.rotation.x += s.x * dt;
    this.cube.rotation.y += s.y * dt;
  }

  dispose() {
    this.grid.geometry.dispose();
    this.grid.material.dispose();
    this.cubeGeometry.dispose();
    this.cubeMaterial.dispose();
    this.hemiLight.dispose();
    this.keyLight.dispose();
    this.scene.remove(this.group);
    this.group.clear();
    this.scene = null;
  }
}
