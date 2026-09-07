import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

/** Soft vignette in post — cheaper than stacking heavy CSS alone. */
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    darkness: { value: 0.42 },
    offset: { value: 1.15 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float darkness;
    uniform float offset;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * vec2(offset, offset * 0.95);
      float v = smoothstep(0.55, 1.35, dot(uv, uv));
      c.rgb = mix(c.rgb, c.rgb * 0.55, v * darkness);
      // warm lift in midtones
      c.rgb *= vec3(1.02, 0.995, 0.97);
      gl_FragColor = c;
    }
  `,
};

/** Soft bloom + vignette + ACES output for a richer first-person look. */
export class PostFX {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    const size = new THREE.Vector2();
    renderer.getSize(size);
    // strength, radius, threshold — keep threshold high so asphalt doesn't glow
    this.bloom = new UnrealBloomPass(size.clone(), 0.38, 0.48, 0.86);
    this.composer.addPass(this.bloom);

    this.vignette = new ShaderPass(VignetteShader);
    this.composer.addPass(this.vignette);
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
