import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/** Soft bloom + ACES output for a richer first-person look. */
export class PostFX {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    const size = new THREE.Vector2();
    renderer.getSize(size);
    this.bloom = new UnrealBloomPass(size, 0.42, 0.55, 0.82);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
  }

  resize(w, h) {
    this.composer.setSize(w, h);
    this.bloom.setSize(w, h);
  }

  render() {
    this.composer.render();
  }
}
