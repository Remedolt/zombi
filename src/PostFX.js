import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/**
 * Half-res bloom only — vignette stays on CSS to avoid an extra full-screen pass.
 */
export class PostFX {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.composer = new EffectComposer(renderer);
    // Keep post below native DPR; bloom is the expensive part.
    this.composer.setPixelRatio(Math.min(renderer.getPixelRatio(), 1));
    this.composer.addPass(new RenderPass(scene, camera));

    const size = new THREE.Vector2();
    renderer.getSize(size);
    // Mild bloom: strength / radius / high threshold — pops lamps & eyes, skips asphalt
    this.bloom = new UnrealBloomPass(size.clone(), 0.32, 0.36, 0.86);
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
