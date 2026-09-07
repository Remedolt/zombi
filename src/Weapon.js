import * as THREE from 'three';
import { WEAPON, COMBAT, lerp, rand } from './constants.js';

function steel(color, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.32,
    metalness: 0.88,
    fog: false,
    ...extras,
  });
}

function polymer(color, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.82,
    metalness: 0.08,
    fog: false,
    ...extras,
  });
}

function addBox(parent, w, h, d, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = false;
  parent.add(mesh);
  return mesh;
}

function addCyl(parent, rTop, rBot, len, segs, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, len, segs), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = false;
  parent.add(mesh);
  return mesh;
}

function softSpriteTexture(stops) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 30);
  for (const [t, c] of stops) g.addColorStop(t, c);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildAssaultRifle() {
  const root = new THREE.Group();
  const dark = steel(0x1a1d22, { roughness: 0.38, metalness: 0.85 });
  const gun = steel(0x3a414c, { roughness: 0.36, metalness: 0.86 });
  const blued = steel(0x12151a, { roughness: 0.28, metalness: 0.92 });
  const poly = polymer(0x1c1e1a);
  const gripMat = polymer(0x151710, { roughness: 0.9 });
  const magCol = polymer(0x2a3222, { roughness: 0.78, metalness: 0.12 });
  const brass = steel(0xb08a3a, { roughness: 0.42, metalness: 0.8 });

  addBox(root, 0.052, 0.062, 0.3, gun, 0, 0.008, 0.01);
  addBox(root, 0.046, 0.038, 0.27, dark, 0, 0.052, -0.01);
  addBox(root, 0.056, 0.018, 0.12, gun, 0, -0.028, 0.02);
  addBox(root, 0.042, 0.028, 0.055, gun, 0, -0.038, -0.015);
  addBox(root, 0.004, 0.028, 0.07, blued, 0.027, 0.03, -0.02);
  addBox(root, 0.05, 0.01, 0.018, dark, 0, 0.072, 0.1);
  addBox(root, 0.012, 0.014, 0.03, dark, 0, 0.072, 0.118);

  for (let i = 0; i < 9; i++) {
    addBox(root, 0.028, 0.01, 0.012, blued, 0, 0.078, 0.06 - i * 0.022);
  }
  addBox(root, 0.022, 0.006, 0.22, dark, 0, 0.072, -0.03);

  addCyl(root, 0.011, 0.012, 0.38, 8, blued, 0, 0.018, -0.34, Math.PI / 2, 0, 0);
  addCyl(root, 0.015, 0.015, 0.04, 8, dark, 0, 0.018, -0.16, Math.PI / 2, 0, 0);
  addCyl(root, 0.007, 0.007, 0.2, 6, dark, 0, 0.04, -0.26, Math.PI / 2, 0, 0);
  addBox(root, 0.022, 0.02, 0.03, dark, 0, 0.04, -0.18);

  addBox(root, 0.048, 0.042, 0.2, dark, 0, 0.01, -0.2);
  for (let i = 0; i < 4; i++) {
    addBox(root, 0.006, 0.016, 0.028, blued, 0.026, 0.01, -0.12 - i * 0.032);
    addBox(root, 0.006, 0.016, 0.028, blued, -0.026, 0.01, -0.12 - i * 0.032);
  }
  addBox(root, 0.046, 0.008, 0.18, dark, 0, -0.014, -0.2);

  addCyl(root, 0.014, 0.016, 0.048, 8, blued, 0, 0.018, -0.55, Math.PI / 2, 0, 0);
  for (const ang of [-0.55, 0.55]) {
    const slot = addBox(root, 0.006, 0.018, 0.022, blued, 0, 0.018, -0.565);
    slot.rotation.z = ang;
  }

  addCyl(root, 0.016, 0.016, 0.14, 8, dark, 0, 0.02, 0.2, Math.PI / 2, 0, 0);
  addBox(root, 0.042, 0.068, 0.14, poly, 0, -0.002, 0.26);
  addBox(root, 0.048, 0.082, 0.028, gripMat, 0, -0.01, 0.335);
  addBox(root, 0.038, 0.02, 0.08, poly, 0, 0.04, 0.27);

  const grip = addBox(root, 0.03, 0.105, 0.036, gripMat, 0, -0.082, 0.055, 0.38, 0, 0);
  for (let i = 0; i < 3; i++) {
    addBox(grip, 0.032, 0.006, 0.034, polymer(0x0e100c), 0, -0.03 + i * 0.028, 0);
  }

  addBox(root, 0.028, 0.004, 0.05, dark, 0, -0.035, 0.05);
  addBox(root, 0.004, 0.028, 0.004, dark, 0, -0.048, 0.068);
  addBox(root, 0.004, 0.028, 0.004, dark, 0, -0.048, 0.032);
  addBox(root, 0.006, 0.018, 0.01, blued, 0, -0.042, 0.05, 0.25, 0, 0);

  const mag = addBox(root, 0.03, 0.14, 0.048, magCol, 0, -0.118, -0.012, 0.12, 0, 0);
  for (let i = 0; i < 5; i++) {
    addBox(mag, 0.032, 0.004, 0.046, polymer(0x1e2418), 0, -0.05 + i * 0.022, 0);
  }
  addBox(mag, 0.028, 0.012, 0.046, brass, 0, -0.065, 0);

  addBox(root, 0.014, 0.04, 0.014, dark, 0, 0.055, -0.42);
  addBox(root, 0.004, 0.02, 0.004, blued, 0, 0.078, -0.42);

  // --- Hollow holographic sight (open front & back so ADS looks THROUGH it) ---
  const optic = new THREE.Group();
  optic.position.set(0, 0.108, 0.018);
  root.add(optic);

  // Mount to rail
  addBox(optic, 0.03, 0.012, 0.048, dark, 0, -0.022, 0);
  addBox(optic, 0.018, 0.01, 0.04, blued, 0, -0.014, 0);

  // Rectangular tunnel frame (no solid backplate)
  const fw = 0.042;
  const fh = 0.04;
  const fd = 0.052;
  const t = 0.0055;
  addBox(optic, fw, t, fd, dark, 0, fh * 0.5, 0); // top
  addBox(optic, fw, t, fd, dark, 0, -fh * 0.5, 0); // bottom
  addBox(optic, t, fh, fd, dark, fw * 0.5, 0, 0); // right
  addBox(optic, t, fh, fd, dark, -fw * 0.5, 0, 0); // left
  // Thin front bezel ring (doesn't seal the tunnel)
  addBox(optic, fw + 0.004, t, t, blued, 0, fh * 0.5, -fd * 0.48);
  addBox(optic, fw + 0.004, t, t, blued, 0, -fh * 0.5, -fd * 0.48);
  addBox(optic, t, fh, t, blued, fw * 0.5, 0, -fd * 0.48);
  addBox(optic, t, fh, t, blued, -fw * 0.5, 0, -fd * 0.48);

  const glassMat = new THREE.MeshBasicMaterial({
    color: 0x6a90a8,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.017, 20), glassMat);
  glass.position.set(0, 0, -0.01);
  optic.add(glass);

  const reticle = new THREE.Mesh(
    new THREE.CircleGeometry(0.0024, 12),
    new THREE.MeshBasicMaterial({
      color: 0xff1a1a,
      fog: false,
      toneMapped: false,
      depthWrite: false,
      transparent: true,
      opacity: 1,
    }),
  );
  reticle.position.set(0, 0, -0.008);
  reticle.renderOrder = 20;
  optic.add(reticle);

  const glow = new THREE.Mesh(
    new THREE.RingGeometry(0.0032, 0.0065, 20),
    new THREE.MeshBasicMaterial({
      color: 0xff4444,
      fog: false,
      transparent: true,
      opacity: 0.65,
      toneMapped: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  glow.position.set(0, 0, -0.007);
  glow.renderOrder = 19;
  optic.add(glow);

  // Soft vignette disc around glass (helps sell "looking through" in ADS)
  const hood = new THREE.Mesh(
    new THREE.RingGeometry(0.017, 0.028, 24),
    new THREE.MeshBasicMaterial({
      color: 0x0a0c10,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    }),
  );
  hood.position.set(0, 0, -0.012);
  hood.visible = false;
  optic.add(hood);

  addBox(root, 0.012, 0.016, 0.016, dark, -0.03, 0.02, 0.06);
  addBox(root, 0.01, 0.014, 0.012, dark, 0.03, -0.01, 0.02);

  const glove = polymer(0x2c241c, { roughness: 0.92, metalness: 0.04 });
  const skin = new THREE.MeshStandardMaterial({
    color: 0xd4a07a,
    roughness: 0.78,
    metalness: 0.02,
    fog: false,
  });

  const handR = new THREE.Group();
  handR.position.set(0.042, -0.068, 0.05);
  handR.rotation.set(0.15, 0.1, -0.4);
  addBox(handR, 0.048, 0.024, 0.07, glove, 0, 0, 0);
  for (let i = 0; i < 4; i++) {
    const f = addBox(handR, 0.01, 0.012, 0.028, glove, -0.016 + i * 0.011, 0.002, -0.045);
    f.rotation.x = -0.55;
  }
  addBox(handR, 0.014, 0.014, 0.024, glove, 0.022, 0.002, -0.02, 0, 0, 0.7);
  root.add(handR);

  const handL = new THREE.Group();
  handL.position.set(-0.04, -0.005, -0.17);
  handL.rotation.set(0.05, -0.05, 0.45);
  addBox(handL, 0.046, 0.022, 0.06, glove, 0, 0, 0);
  for (let i = 0; i < 4; i++) {
    const f = addBox(handL, 0.01, 0.011, 0.026, glove, -0.015 + i * 0.01, 0.002, -0.04);
    f.rotation.x = -0.4;
  }
  addBox(handL, 0.012, 0.012, 0.02, skin, 0.02, 0.002, -0.01);
  root.add(handL);

  root.userData.muzzleLocal = new THREE.Vector3(0, 0.018, -0.575);
  root.userData.magazine = mag;
  root.userData.magHome = mag.position.clone();
  root.userData.handR = handR;
  root.userData.handL = handL;
  root.userData.optic = optic;
  root.userData.reticle = reticle;
  root.userData.opticGlow = glow;
  root.userData.opticHood = hood;
  root.userData.opticGlass = glass;
  // Eye aim point in model space (center of open aperture)
  root.userData.opticAim = new THREE.Vector3(0, 0.108, 0.018);
  return root;
}

function flashTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,255,245,1)');
  g.addColorStop(0.2, 'rgba(255,210,120,0.9)');
  g.addColorStop(0.55, 'rgba(255,100,20,0.45)');
  g.addColorStop(1, 'rgba(40,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const MAX_PARTICLES = 48;
const MAX_TRACERS = 12;
const MAX_CASINGS = 14;
const MAX_IMPACTS = 20;

export class Weapon {
  constructor(camera, scene, world, sound, _assets) {
    this.camera = camera;
    this.scene = scene;
    this.world = world;
    this.sound = sound;

    this.root = new THREE.Group();
    this.model = buildAssaultRifle();
    this.root.add(this.model);
    this.root.scale.setScalar(1.05);
    camera.add(this.root);

    // Hip: classic lower-right. ADS: optic aperture centered on camera look axis.
    const aim = this.model.userData.opticAim;
    const s = 1.05;
    this.hipPos = new THREE.Vector3(0.24, -0.22, -0.46);
    // Bring eye just behind the open optic tunnel; aperture fills zoomed FOV
    this.adsPos = new THREE.Vector3(-aim.x * s, -aim.y * s, -0.11 - aim.z * s);
    this.hipRot = new THREE.Euler(0.02, 0.05, -0.02);
    this.adsRot = new THREE.Euler(0.0, 0.0, 0.0);
    this.root.position.copy(this.hipPos);
    this.root.rotation.copy(this.hipRot);

    this._basePos = new THREE.Vector3();
    this._sway = new THREE.Vector3();
    this._jitter = new THREE.Vector3();
    this._time = 0;
    this._kickZ = 0;
    this._lastFov = -1;
    this._tmpDir = new THREE.Vector3();
    this._tmpVel = new THREE.Vector3();

    this.viewLight = new THREE.PointLight(0xffe8d0, 1.6, 1.2, 2);
    this.viewLight.position.set(0.02, 0.12, 0.14);
    this.root.add(this.viewLight);

    const muzzle = this.model.userData.muzzleLocal || new THREE.Vector3(0, 0.018, -0.575);

    this.flashSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: flashTexture(),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        depthTest: false,
      }),
    );
    this.flashSprite.scale.set(0.22, 0.22, 1);
    this.flashSprite.visible = false;
    this.flashSprite.position.copy(muzzle);
    this.flashSprite.renderOrder = 10;
    this.model.add(this.flashSprite);

    this.muzzleLight = new THREE.PointLight(0xffb060, 0, 7, 2);
    this.muzzleLight.position.copy(muzzle);
    this.model.add(this.muzzleLight);

    this._smokeTex = softSpriteTexture([
      [0, 'rgba(190,190,185,0.55)'],
      [0.45, 'rgba(140,140,135,0.28)'],
      [1, 'rgba(80,80,80,0)'],
    ]);
    this._sparkTex = softSpriteTexture([
      [0, 'rgba(255,255,220,1)'],
      [0.25, 'rgba(255,180,60,0.9)'],
      [1, 'rgba(255,40,0,0)'],
    ]);
    this._dustTex = softSpriteTexture([
      [0, 'rgba(170,150,120,0.55)'],
      [0.5, 'rgba(120,100,70,0.25)'],
      [1, 'rgba(60,50,30,0)'],
    ]);
    this._bloodTex = softSpriteTexture([
      [0, 'rgba(140,10,10,0.85)'],
      [0.4, 'rgba(90,0,0,0.4)'],
      [1, 'rgba(40,0,0,0)'],
    ]);

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = WEAPON.range;
    this.shootOrigin = new THREE.Vector3();
    this.shootDir = new THREE.Vector3();
    this.hitPoint = new THREE.Vector3();
    this.muzzleWorld = new THREE.Vector3();
    this._tmpV = new THREE.Vector3();
    this._tmpN = new THREE.Vector3();
    this._right = new THREE.Vector3();
    this._up = new THREE.Vector3(0, 1, 0);

    this.mag = WEAPON.magSize;
    this.reserve = WEAPON.reserve;
    this.cooldown = 0;
    this.reloading = false;
    this.reloadT = 0;
    this.recoil = 0;
    this.recoilYaw = 0;
    this.ads = 0;
    this.flashT = 0;
    this.firing = false;
    this.wantReload = false;
    this.smokeBuildup = 0;

    this.tracers = [];
    this.impacts = [];
    this.particles = [];
    this.casings = [];
    this._freeParticles = [];
    this._freeTracers = [];
    this._freeCasings = [];

    this._tracerGeo = new THREE.CylinderGeometry(0.008, 0.003, 1, 4);
    this._tracerGeo.rotateX(Math.PI / 2);
    this._tracerMat = new THREE.MeshBasicMaterial({
      color: 0xffc060,
      transparent: true,
      opacity: 0.9,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this._casingGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.018, 5);
    this._casingMat = new THREE.MeshBasicMaterial({ color: 0xc9a24a, fog: false });
    this._decalGeo = new THREE.CircleGeometry(0.045, 8);
    this._decalMat = new THREE.MeshBasicMaterial({
      color: 0x1a1510,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    this._impactCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffe0a0,
      transparent: true,
      opacity: 0.9,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this._impactCoreGeo = new THREE.SphereGeometry(0.028, 6, 6);

    this._initPools();

    this.aiming = false;
    this._onDown = (e) => {
      if (e.button === 0) this.firing = true;
      if (e.button === 2) this.aiming = true;
    };
    this._onUp = (e) => {
      if (e.button === 0) this.firing = false;
      if (e.button === 2) this.aiming = false;
    };
    this._onKey = (e) => {
      if (e.code === 'KeyR') this.wantReload = true;
    };
    document.addEventListener('mousedown', this._onDown);
    document.addEventListener('mouseup', this._onUp);
    document.addEventListener('keydown', this._onKey);
  }

  _initPools() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const mat = new THREE.SpriteMaterial({
        map: this._smokeTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
        fog: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.visible = false;
      this.scene.add(sprite);
      this._freeParticles.push({
        sprite,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 1,
        grow: 1,
        drag: 1.8,
      });
    }
    for (let i = 0; i < MAX_TRACERS; i++) {
      const mesh = new THREE.Mesh(this._tracerGeo, this._tracerMat.clone());
      mesh.visible = false;
      this.scene.add(mesh);
      this._freeTracers.push({ mesh, life: 0 });
    }
    for (let i = 0; i < MAX_CASINGS; i++) {
      const mesh = new THREE.Mesh(this._casingGeo, this._casingMat);
      mesh.visible = false;
      this.scene.add(mesh);
      this._freeCasings.push({
        mesh,
        vel: new THREE.Vector3(),
        spin: new THREE.Vector3(),
        life: 0,
      });
    }
  }

  get adsActive() {
    return this.ads > 0.55;
  }

  reset() {
    this.mag = WEAPON.magSize;
    this.reserve = WEAPON.reserve;
    this.cooldown = 0;
    this.reloading = false;
    this.reloadT = 0;
    this.recoil = 0;
    this.recoilYaw = 0;
    this.ads = 0;
    this.flashT = 0;
    this.firing = false;
    this.wantReload = false;
    this.smokeBuildup = 0;
    this._kickZ = 0;
    const mag = this.model.userData.magazine;
    const home = this.model.userData.magHome;
    if (mag && home) {
      mag.position.copy(home);
      mag.visible = true;
      mag.rotation.z = 0;
    }
    this.clearEffects();
  }

  clearEffects() {
    while (this.particles.length) {
      const p = this.particles.pop();
      p.sprite.visible = false;
      p.life = 0;
      this._freeParticles.push(p);
    }
    while (this.tracers.length) {
      const t = this.tracers.pop();
      t.mesh.visible = false;
      this._freeTracers.push(t);
    }
    while (this.casings.length) {
      const c = this.casings.pop();
      c.mesh.visible = false;
      this._freeCasings.push(c);
    }
    for (const i of this.impacts) this.scene.remove(i.mesh);
    this.impacts.length = 0;
  }

  tryReload() {
    if (this.reloading || this.mag >= WEAPON.magSize || this.reserve <= 0) return;
    this.reloading = true;
    this.reloadT = 0;
    this.sound.reload();
  }

  _spawnParticle(tex, pos, vel, life, scale, color = 0xffffff, grow = 1.6) {
    let p = this._freeParticles.pop();
    if (!p) {
      if (!this.particles.length) return;
      p = this.particles.shift();
    }
    p.sprite.material.map = tex;
    p.sprite.material.color.setHex(color);
    p.sprite.material.opacity = 0.9;
    p.sprite.position.copy(pos);
    p.sprite.scale.setScalar(scale);
    p.sprite.visible = true;
    p.vel.copy(vel);
    p.life = life;
    p.maxLife = life;
    p.grow = grow;
    p.drag = 1.8;
    this.particles.push(p);
  }

  _burst(tex, origin, normal, count, speed, life, scale, color, grow) {
    for (let i = 0; i < count; i++) {
      this._tmpDir.copy(normal || this.shootDir).normalize();
      this._tmpDir.x += rand(-0.7, 0.7);
      this._tmpDir.y += rand(-0.5, 0.9);
      this._tmpDir.z += rand(-0.7, 0.7);
      this._tmpDir.normalize().multiplyScalar(speed * rand(0.4, 1.2));
      this._spawnParticle(
        tex,
        origin,
        this._tmpDir,
        life * rand(0.6, 1.2),
        scale * rand(0.6, 1.3),
        color,
        grow,
      );
    }
  }

  _spawnMuzzleFX() {
    this.flashSprite.getWorldPosition(this.muzzleWorld);
    this.camera.getWorldDirection(this.shootDir);
    this._tmpVel.copy(this.shootDir).multiplyScalar(0.55);
    this._tmpVel.x += rand(-0.15, 0.15);
    this._tmpVel.y += rand(0.05, 0.2);
    this._tmpVel.z += rand(-0.15, 0.15);
    this._spawnParticle(
      this._smokeTex,
      this.muzzleWorld,
      this._tmpVel,
      0.35 + this.smokeBuildup * 0.12,
      0.07 + this.smokeBuildup * 0.03,
      0xddd8d0,
      2.2,
    );
    for (let i = 0; i < 2; i++) {
      this._tmpVel.copy(this.shootDir).multiplyScalar(rand(3.5, 7));
      this._tmpVel.x += rand(-1.2, 1.2);
      this._tmpVel.y += rand(-0.6, 1);
      this._tmpVel.z += rand(-1.2, 1.2);
      this._spawnParticle(this._sparkTex, this.muzzleWorld, this._tmpVel, 0.07, 0.03, 0xffcc66, 0.4);
    }
  }

  _spawnCasing() {
    this.model.updateWorldMatrix(true, false);
    this._tmpV.set(0.04, 0.03, -0.02);
    this.model.localToWorld(this._tmpV);
    let c = this._freeCasings.pop();
    if (!c) {
      if (!this.casings.length) return;
      c = this.casings.shift();
    }
    c.mesh.position.copy(this._tmpV);
    c.mesh.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    c.mesh.visible = true;
    this._right.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
    c.vel
      .copy(this._right)
      .multiplyScalar(rand(1.6, 2.4))
      .addScaledVector(this._up, rand(1.1, 1.8))
      .addScaledVector(this.shootDir, rand(-0.2, 0.3));
    c.spin.set(rand(-10, 10), rand(-10, 10), rand(-10, 10));
    c.life = 0.7;
    this.casings.push(c);
  }

  tryFire(canShoot, zombies) {
    if (!canShoot || this.reloading) return null;
    if (this.mag <= 0) {
      this.sound.empty();
      this.cooldown = 0.22;
      this.tryReload();
      return { empty: true };
    }
    this.mag -= 1;
    this.cooldown = WEAPON.fireInterval;
    this.recoil += WEAPON.recoilPitch * (this.ads > 0.5 ? 0.65 : 1);
    this.recoilYaw += (Math.random() - 0.5) * WEAPON.recoilYaw * (this.ads > 0.5 ? 0.55 : 1);
    this.flashT = 0.045;
    this._kickZ = 0.022;
    this.smokeBuildup = Math.min(1.2, this.smokeBuildup + 0.1);
    this.sound.fire();
    this.sound.casing();

    this.camera.getWorldPosition(this.shootOrigin);
    this.camera.getWorldDirection(this.shootDir);
    this.raycaster.set(this.shootOrigin, this.shootDir);

    const zombieMeshes = [];
    for (const z of zombies) {
      if (!z.alive) continue;
      zombieMeshes.push(z.group);
    }
    const zombieHits = this.raycaster.intersectObjects(zombieMeshes, true);
    const worldHits = this.raycaster.intersectObjects(this.world.staticMeshes, true);
    const zombieHit = zombieHits[0];
    const worldHit = worldHits[0];
    const hitZombie =
      zombieHit && (!worldHit || zombieHit.distance <= worldHit.distance + 0.7);

    this.model.updateWorldMatrix(true, false);
    this.flashSprite.getWorldPosition(this.muzzleWorld);
    this._spawnMuzzleFX();
    this._spawnCasing();

    let result = { hit: false, headshot: false, killed: false, xp: 0, zombie: null, point: null };

    if (hitZombie) {
      const hit = zombieHit;
      this.hitPoint.copy(hit.point);
      this._spawnTracer(this.muzzleWorld, hit.point);
      const zombie = hit.object.userData.zombie;
      if (zombie && zombie.alive) {
        const local = zombie.group.worldToLocal(hit.point.clone());
        const headshot =
          hit.object.userData.part === 'head' || local.y > COMBAT.headHeight;
        const applied = zombie.applyHit(WEAPON.damage, headshot, hit.point, this.shootDir);
        result = {
          hit: true,
          headshot,
          killed: applied.killed,
          xp: applied.xp,
          zombie,
          point: hit.point.clone(),
        };
        this.sound.hit(headshot);
        this._spawnBlood(hit.point, this.shootDir, headshot);
      }
    } else if (worldHit) {
      this.hitPoint.copy(worldHit.point);
      this._spawnTracer(this.muzzleWorld, worldHit.point);
      const barrel = worldHit.object.userData.barrel;
      if (barrel && !barrel.exploded) {
        result.blast = this.world.explodeBarrel(barrel);
      } else {
        this._spawnImpact(worldHit.point, worldHit.face?.normal, worldHit.object);
      }
    } else {
      const far = this.shootOrigin.clone().addScaledVector(this.shootDir, WEAPON.range);
      this._spawnTracer(this.muzzleWorld, far);
    }

    if (this.mag === 0) this.tryReload();
    return result;
  }

  _spawnTracer(from, to) {
    let t = this._freeTracers.pop();
    if (!t) {
      if (!this.tracers.length) return;
      t = this.tracers.shift();
    }
    const dir = this._tmpDir.subVectors(to, from);
    const len = Math.max(0.2, dir.length());
    const streak = Math.min(len, 2.8 + Math.random());
    dir.normalize();
    this._tmpV.copy(from).addScaledVector(dir, streak * 0.5);
    t.mesh.scale.set(1, 1, streak);
    t.mesh.position.copy(this._tmpV);
    t.mesh.lookAt(this._tmpN.copy(from).addScaledVector(dir, streak));
    t.mesh.material.opacity = 0.9;
    t.mesh.visible = true;
    t.life = WEAPON.tracerLife * 1.2;
    this.tracers.push(t);
  }

  _spawnBlood(point, dir, headshot) {
    this._tmpN.copy(dir).multiplyScalar(-1);
    this._burst(this._bloodTex, point, this._tmpN, headshot ? 7 : 4, headshot ? 3 : 2, 0.28, 0.07, 0xaa2211, 1.6);
  }

  _spawnImpact(point, normal, object) {
    if (normal) {
      this._tmpN.copy(normal).transformDirection(object.matrixWorld).normalize();
    } else {
      this._tmpN.copy(this.shootDir).multiplyScalar(-1);
    }

    if (this.impacts.length >= MAX_IMPACTS) {
      const old = this.impacts.shift();
      this.scene.remove(old.mesh);
    }

    const core = new THREE.Mesh(this._impactCoreGeo, this._impactCoreMat.clone());
    core.position.copy(point).addScaledVector(this._tmpN, 0.03);
    this.scene.add(core);
    this.impacts.push({ mesh: core, life: 0.08, fade: true });

    const decal = new THREE.Mesh(this._decalGeo, this._decalMat.clone());
    decal.position.copy(point).addScaledVector(this._tmpN, 0.015);
    decal.lookAt(this._tmpV.copy(point).add(this._tmpN));
    this.scene.add(decal);
    this.impacts.push({ mesh: decal, life: 3.2, fade: true });

    this._burst(this._sparkTex, point, this._tmpN, 5, 4, 0.14, 0.04, 0xffcc66, 0.35);
    this._burst(this._dustTex, point, this._tmpN, 3, 1.2, 0.4, 0.1, 0xc4b090, 2);
  }

  _updateReloadPose(k) {
    const mag = this.model.userData.magazine;
    const home = this.model.userData.magHome;
    if (mag && home) {
      if (k < 0.35) {
        const t = k / 0.35;
        mag.position.y = home.y - t * 0.22;
        mag.position.x = home.x + t * 0.04;
        mag.rotation.z = t * 0.4;
        mag.visible = true;
      } else if (k < 0.55) {
        mag.visible = false;
        mag.position.copy(home);
        mag.position.y = home.y - 0.24;
        mag.rotation.z = 0;
      } else {
        mag.visible = true;
        const t = (k - 0.55) / 0.45;
        const ease = 1 - Math.pow(1 - t, 2);
        mag.position.y = home.y - 0.22 * (1 - ease);
        mag.position.x = home.x;
        mag.rotation.z = 0;
      }
    }
    const tilt = Math.sin(Math.min(k, 1) * Math.PI);
    this.root.rotation.x = tilt * 0.42;
    this.root.rotation.z = -tilt * 0.18;
    this.root.rotation.y = tilt * 0.08;
  }

  update(dt, input, canShoot, zombies) {
    this._time += dt;
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.flashT = Math.max(0, this.flashT - dt);
    this.smokeBuildup = Math.max(0, this.smokeBuildup - dt * 0.55);
    this._kickZ = lerp(this._kickZ, 0, 18 * dt);

    const flashing = this.flashT > 0;
    this.flashSprite.visible = flashing;
    if (flashing) {
      this.flashSprite.material.rotation = Math.random() * Math.PI;
      const pulse = 0.18 + this.flashT * 3.5;
      this.flashSprite.scale.set(pulse, pulse, 1);
    }
    this.muzzleLight.intensity = flashing ? 12 + Math.random() * 6 : 0;

    void input;
    const adsTarget = this.aiming && canShoot && !this.reloading ? 1 : 0;
    this.ads = lerp(this.ads, adsTarget, 1 - Math.pow(0.0004, dt));

    this._basePos.lerpVectors(this.hipPos, this.adsPos, this.ads);
    const swayAmp = (1 - this.ads) * 0.007;
    this._sway.set(
      Math.sin(this._time * 1.7) * swayAmp,
      Math.cos(this._time * 2.1) * swayAmp * 0.7,
      0,
    );
    this.root.position.copy(this._basePos).add(this._sway);
    this.root.position.z += this._kickZ * (1 - this.ads * 0.55);

    const rx = lerp(this.hipRot.x, this.adsRot.x, this.ads);
    const ry = lerp(this.hipRot.y, this.adsRot.y, this.ads);
    const rz = lerp(this.hipRot.z, this.adsRot.z, this.ads);

    // Hands fully out of the way when aimed; optic hood sells the sight picture
    if (this.model.userData.handR) {
      const hideHands = this.ads > 0.72;
      this.model.userData.handR.visible = !hideHands;
      this.model.userData.handL.visible = !hideHands;
      if (!hideHands) {
        const handFade = 1 - this.ads * 0.7;
        this.model.userData.handR.scale.setScalar(handFade);
        this.model.userData.handL.scale.setScalar(Math.max(0.4, 1 - this.ads * 0.5));
      }
    }
    const hood = this.model.userData.opticHood;
    const glass = this.model.userData.opticGlass;
    const reticle = this.model.userData.reticle;
    if (hood) {
      hood.visible = this.ads > 0.45;
      hood.material.opacity = Math.min(0.72, (this.ads - 0.45) * 1.6);
    }
    if (glass) glass.material.opacity = lerp(0.12, 0.06, this.ads);
    if (reticle) {
      const r = lerp(0.0024, 0.0032, this.ads);
      reticle.scale.setScalar(r / 0.0024);
      reticle.material.depthTest = this.ads < 0.65;
    }

    if (this.reloading) {
      this.reloadT += dt;
      const k = Math.min(1, this.reloadT / WEAPON.reloadTime);
      this._updateReloadPose(k);
      if (this.reloadT >= WEAPON.reloadTime) {
        const need = WEAPON.magSize - this.mag;
        const take = Math.min(need, this.reserve);
        this.mag += take;
        this.reserve -= take;
        this.reloading = false;
        this.reloadT = 0;
        const mag = this.model.userData.magazine;
        const home = this.model.userData.magHome;
        if (mag && home) {
          mag.visible = true;
          mag.position.copy(home);
          mag.rotation.z = 0;
        }
        this.root.rotation.set(rx, ry, rz);
      }
    } else {
      this.root.rotation.x = lerp(this.root.rotation.x, rx - this.recoil * 2.2, 14 * dt);
      this.root.rotation.y = lerp(this.root.rotation.y, ry + this.recoilYaw, 12 * dt);
      this.root.rotation.z = lerp(this.root.rotation.z, rz - this.recoilYaw * 0.45, 12 * dt);
    }

    this.recoil = lerp(this.recoil, 0, 9 * dt);
    this.recoilYaw = lerp(this.recoilYaw, 0, 9 * dt);

    const fov = lerp(WEAPON.hipFov, WEAPON.adsFov, this.ads);
    if (Math.abs(fov - this._lastFov) > 0.04) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this._lastFov = fov;
    }
    this.viewLight.intensity = lerp(1.6, 0.7, this.ads);

    if (this.wantReload) {
      this.wantReload = false;
      this.tryReload();
    }

    let shot = null;
    if (this.firing && this.cooldown <= 0) {
      shot = this.tryFire(canShoot, zombies);
      if (shot?.empty) this.firing = false;
    }

    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life -= dt;
      t.mesh.material.opacity = Math.max(0, t.life / (WEAPON.tracerLife * 1.2));
      if (t.life <= 0) {
        t.mesh.visible = false;
        this.tracers.splice(i, 1);
        this._freeTracers.push(t);
      }
    }
    for (let i = this.impacts.length - 1; i >= 0; i--) {
      const p = this.impacts[i];
      p.life -= dt;
      if (p.fade && p.mesh.material) {
        p.mesh.material.opacity *= p.life > 0.4 ? 1 : 0.9;
      }
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.material?.dispose?.();
        this.impacts.splice(i, 1);
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.vel.y -= 1.1 * dt;
      p.vel.multiplyScalar(Math.max(0, 1 - p.drag * dt));
      p.sprite.position.addScaledVector(p.vel, dt);
      const age = 1 - p.life / p.maxLife;
      p.sprite.scale.multiplyScalar(1 + (p.grow - 1) * dt);
      p.sprite.material.opacity = Math.max(0, (1 - age) * 0.85);
      if (p.life <= 0) {
        p.sprite.visible = false;
        this.particles.splice(i, 1);
        this._freeParticles.push(p);
      }
    }
    for (let i = this.casings.length - 1; i >= 0; i--) {
      const c = this.casings[i];
      c.life -= dt;
      c.vel.y -= 9.5 * dt;
      c.mesh.position.addScaledVector(c.vel, dt);
      c.mesh.rotation.x += c.spin.x * dt;
      c.mesh.rotation.y += c.spin.y * dt;
      if (c.mesh.position.y < 0.05) {
        c.mesh.position.y = 0.05;
        c.vel.y *= -0.2;
        c.vel.x *= 0.55;
        c.vel.z *= 0.55;
      }
      if (c.life <= 0) {
        c.mesh.visible = false;
        this.casings.splice(i, 1);
        this._freeCasings.push(c);
      }
    }

    return shot;
  }

  dispose() {
    document.removeEventListener('mousedown', this._onDown);
    document.removeEventListener('mouseup', this._onUp);
    document.removeEventListener('keydown', this._onKey);
    this.camera.remove(this.root);
    this.clearEffects();
    for (const p of this._freeParticles) this.scene.remove(p.sprite);
    for (const t of this._freeTracers) this.scene.remove(t.mesh);
    for (const c of this._freeCasings) this.scene.remove(c.mesh);
  }
}
