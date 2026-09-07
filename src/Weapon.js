import * as THREE from 'three';
import { WEAPON, COMBAT, lerp, rand } from './constants.js';

function steel(color, extras = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.28,
    metalness: 0.92,
    clearcoat: 0.35,
    clearcoatRoughness: 0.45,
    reflectivity: 0.6,
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
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function addCyl(parent, rTop, rBot, len, segs, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, len, segs), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = true;
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
  const dark = steel(0x1a1d22, { roughness: 0.34, metalness: 0.88, clearcoat: 0.2 });
  const gun = steel(0x3a414c, { roughness: 0.32, metalness: 0.9 });
  const blued = steel(0x12151a, { roughness: 0.22, metalness: 0.95, clearcoat: 0.55 });
  const poly = polymer(0x1c1e1a);
  const gripMat = polymer(0x151710, { roughness: 0.9 });
  const magCol = polymer(0x2a3222, { roughness: 0.78, metalness: 0.12 });
  const brass = steel(0xb08a3a, { roughness: 0.4, metalness: 0.85, clearcoat: 0.15 });

  addBox(root, 0.052, 0.062, 0.3, gun, 0, 0.008, 0.01);
  addBox(root, 0.046, 0.038, 0.27, dark, 0, 0.052, -0.01);
  addBox(root, 0.056, 0.018, 0.12, gun, 0, -0.028, 0.02);
  addBox(root, 0.042, 0.028, 0.055, gun, 0, -0.038, -0.015);
  addBox(root, 0.004, 0.028, 0.07, blued, 0.027, 0.03, -0.02);
  addBox(root, 0.05, 0.01, 0.018, dark, 0, 0.072, 0.1);
  addBox(root, 0.012, 0.014, 0.03, dark, 0, 0.072, 0.118);

  for (let i = 0; i < 11; i++) {
    addBox(root, 0.028, 0.01, 0.012, blued, 0, 0.078, 0.08 - i * 0.022);
  }
  addBox(root, 0.022, 0.006, 0.24, dark, 0, 0.072, -0.03);

  addCyl(root, 0.011, 0.012, 0.38, 12, blued, 0, 0.018, -0.34, Math.PI / 2, 0, 0);
  addCyl(root, 0.015, 0.015, 0.04, 10, dark, 0, 0.018, -0.16, Math.PI / 2, 0, 0);
  addCyl(root, 0.007, 0.007, 0.2, 8, dark, 0, 0.04, -0.26, Math.PI / 2, 0, 0);
  addBox(root, 0.022, 0.02, 0.03, dark, 0, 0.04, -0.18);

  addBox(root, 0.048, 0.042, 0.2, dark, 0, 0.01, -0.2);
  for (let i = 0; i < 5; i++) {
    addBox(root, 0.006, 0.016, 0.028, blued, 0.026, 0.01, -0.12 - i * 0.028);
    addBox(root, 0.006, 0.016, 0.028, blued, -0.026, 0.01, -0.12 - i * 0.028);
  }
  addBox(root, 0.046, 0.008, 0.18, dark, 0, -0.014, -0.2);

  addCyl(root, 0.014, 0.016, 0.048, 10, blued, 0, 0.018, -0.55, Math.PI / 2, 0, 0);
  for (const ang of [-0.55, 0, 0.55]) {
    const slot = addBox(root, 0.006, 0.018, 0.022, blued, 0, 0.018, -0.565);
    slot.rotation.z = ang;
  }

  addCyl(root, 0.016, 0.016, 0.14, 10, dark, 0, 0.02, 0.2, Math.PI / 2, 0, 0);
  addBox(root, 0.042, 0.068, 0.14, poly, 0, -0.002, 0.26);
  addBox(root, 0.048, 0.082, 0.028, gripMat, 0, -0.01, 0.335);
  addBox(root, 0.038, 0.02, 0.08, poly, 0, 0.04, 0.27);

  const grip = addBox(root, 0.03, 0.105, 0.036, gripMat, 0, -0.082, 0.055, 0.38, 0, 0);
  for (let i = 0; i < 4; i++) {
    addBox(grip, 0.032, 0.006, 0.034, polymer(0x0e100c), 0, -0.03 + i * 0.022, 0);
  }

  addBox(root, 0.028, 0.004, 0.05, dark, 0, -0.035, 0.05);
  addBox(root, 0.004, 0.028, 0.004, dark, 0, -0.048, 0.068);
  addBox(root, 0.004, 0.028, 0.004, dark, 0, -0.048, 0.032);
  addBox(root, 0.006, 0.018, 0.01, blued, 0, -0.042, 0.05, 0.25, 0, 0);

  const mag = addBox(root, 0.03, 0.14, 0.048, magCol, 0, -0.118, -0.012, 0.12, 0, 0);
  for (let i = 0; i < 6; i++) {
    addBox(mag, 0.032, 0.004, 0.046, polymer(0x1e2418), 0, -0.05 + i * 0.02, 0);
  }
  addBox(mag, 0.028, 0.012, 0.046, brass, 0, -0.065, 0);

  addBox(root, 0.014, 0.04, 0.014, dark, 0, 0.055, -0.42);
  addBox(root, 0.004, 0.02, 0.004, blued, 0, 0.078, -0.42);

  const optic = addBox(root, 0.034, 0.034, 0.055, dark, 0, 0.1, 0.015);
  addCyl(
    optic,
    0.012,
    0.012,
    0.02,
    12,
    steel(0x0a1018, { roughness: 0.15, metalness: 0.4, transparent: true, opacity: 0.55 }),
    0,
    0.004,
    0.02,
    Math.PI / 2,
    0,
    0,
  );
  const reticle = new THREE.Mesh(
    new THREE.CircleGeometry(0.0035, 10),
    new THREE.MeshBasicMaterial({ color: 0xff2a2a, fog: false, toneMapped: false }),
  );
  reticle.position.set(0, 0.104, 0.04);
  root.add(reticle);
  const glow = new THREE.Mesh(
    new THREE.RingGeometry(0.005, 0.009, 16),
    new THREE.MeshBasicMaterial({
      color: 0xff4444,
      fog: false,
      transparent: true,
      opacity: 0.55,
      toneMapped: false,
    }),
  );
  glow.position.copy(reticle.position);
  glow.position.z += 0.001;
  root.add(glow);

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

  // Hide hands slightly during ADS via userData refs
  root.userData.muzzleLocal = new THREE.Vector3(0, 0.018, -0.575);
  root.userData.magazine = mag;
  root.userData.magHome = mag.position.clone();
  root.userData.handR = handR;
  root.userData.handL = handL;
  root.userData.reticle = reticle;
  return root;
}

function flashTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 60);
  g.addColorStop(0, 'rgba(255,255,245,1)');
  g.addColorStop(0.12, 'rgba(255,230,160,0.95)');
  g.addColorStop(0.35, 'rgba(255,140,40,0.75)');
  g.addColorStop(0.7, 'rgba(255,60,0,0.25)');
  g.addColorStop(1, 'rgba(40,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = 'rgba(255,220,160,0.85)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(64 + Math.cos(a) * 8, 64 + Math.sin(a) * 8);
    ctx.lineTo(64 + Math.cos(a) * 58, 64 + Math.sin(a) * 58);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const MAX_PARTICLES = 96;

export class Weapon {
  constructor(camera, scene, world, sound, _assets) {
    this.camera = camera;
    this.scene = scene;
    this.world = world;
    this.sound = sound;

    this.root = new THREE.Group();
    // Procedural M4 reads better in first-person than a missing/optional GLB.
    this.model = buildAssaultRifle();
    this.root.add(this.model);
    this.root.position.set(0.24, -0.22, -0.46);
    this.root.rotation.set(0.02, 0.05, -0.02);
    this.root.scale.setScalar(1.08);
    camera.add(this.root);

    this.hipPos = new THREE.Vector3(0.24, -0.22, -0.46);
    this.adsPos = new THREE.Vector3(0.0, -0.112, -0.32);
    this.hipRot = new THREE.Euler(0.02, 0.05, -0.02);
    this.adsRot = new THREE.Euler(0.0, 0.0, 0.0);
    this._basePos = new THREE.Vector3();
    this._sway = new THREE.Vector3();
    this._time = 0;
    this._kickZ = 0;

    this.viewLight = new THREE.PointLight(0xffe8d0, 2.1, 1.35, 1.7);
    this.viewLight.position.set(0.02, 0.14, 0.16);
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
    this.flashSprite.scale.set(0.26, 0.26, 1);
    this.flashSprite.visible = false;
    this.flashSprite.position.copy(muzzle);
    this.flashSprite.renderOrder = 10;
    this.model.add(this.flashSprite);

    this.flashSpriteB = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: softSpriteTexture([
          [0, 'rgba(255,240,200,0.9)'],
          [0.4, 'rgba(255,140,40,0.45)'],
          [1, 'rgba(0,0,0,0)'],
        ]),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        depthTest: false,
      }),
    );
    this.flashSpriteB.scale.set(0.14, 0.42, 1);
    this.flashSpriteB.visible = false;
    this.flashSpriteB.position.copy(muzzle);
    this.flashSpriteB.position.z -= 0.02;
    this.flashSpriteB.renderOrder = 11;
    this.model.add(this.flashSpriteB);

    this.muzzleLight = new THREE.PointLight(0xffb060, 0, 9, 2);
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

    this._tracerGeo = new THREE.CylinderGeometry(0.01, 0.0035, 1, 5);
    this._tracerGeo.rotateX(Math.PI / 2);
    this._tracerMat = new THREE.MeshBasicMaterial({
      color: 0xffc060,
      transparent: true,
      opacity: 0.92,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this._casingGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.018, 6);
    this._casingMat = new THREE.MeshStandardMaterial({
      color: 0xc9a24a,
      metalness: 0.85,
      roughness: 0.35,
      fog: false,
    });
    this._decalGeo = new THREE.CircleGeometry(0.05, 10);

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
    if (mag && home) mag.position.copy(home);
    this.clearEffects();
  }

  clearEffects() {
    for (const t of this.tracers) {
      this.scene.remove(t.mesh);
      t.mesh.material.dispose();
    }
    for (const i of this.impacts) {
      this.scene.remove(i.mesh);
      i.mesh.material?.dispose?.();
    }
    for (const p of this.particles) {
      this.scene.remove(p.sprite);
      p.sprite.material.dispose();
    }
    for (const c of this.casings) {
      this.scene.remove(c.mesh);
    }
    this.tracers.length = 0;
    this.impacts.length = 0;
    this.particles.length = 0;
    this.casings.length = 0;
  }

  tryReload() {
    if (this.reloading || this.mag >= WEAPON.magSize || this.reserve <= 0) return;
    this.reloading = true;
    this.reloadT = 0;
    this.sound.reload();
  }

  _spawnParticle(tex, pos, vel, life, scale, color = 0xffffff, grow = 1.6) {
    if (this.particles.length >= MAX_PARTICLES) {
      const old = this.particles.shift();
      this.scene.remove(old.sprite);
      old.sprite.material.dispose();
    }
    const mat = new THREE.SpriteMaterial({
      map: tex,
      color,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.9,
      fog: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(pos);
    sprite.scale.setScalar(scale);
    this.scene.add(sprite);
    this.particles.push({
      sprite,
      vel: vel.clone(),
      life,
      maxLife: life,
      grow,
      drag: 1.8,
    });
  }

  _burst(tex, origin, normal, count, speed, life, scale, color, grow) {
    for (let i = 0; i < count; i++) {
      const dir = this._tmpV
        .copy(normal || this.shootDir)
        .normalize()
        .add(
          new THREE.Vector3(rand(-0.7, 0.7), rand(-0.5, 0.9), rand(-0.7, 0.7)),
        )
        .normalize();
      this._spawnParticle(
        tex,
        origin,
        dir.multiplyScalar(speed * rand(0.4, 1.2)),
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
    // Smoke puff from barrel
    this._spawnParticle(
      this._smokeTex,
      this.muzzleWorld,
      this.shootDir.clone().multiplyScalar(0.6).add(new THREE.Vector3(rand(-0.2, 0.2), rand(0.05, 0.25), rand(-0.2, 0.2))),
      0.45 + this.smokeBuildup * 0.15,
      0.08 + this.smokeBuildup * 0.04,
      0xddd8d0,
      2.4,
    );
    if (this.smokeBuildup > 0.4) {
      this._spawnParticle(
        this._smokeTex,
        this.muzzleWorld.clone().addScaledVector(this.shootDir, 0.12),
        new THREE.Vector3(rand(-0.15, 0.15), rand(0.1, 0.35), rand(-0.15, 0.15)),
        0.7,
        0.12,
        0xc8c4bc,
        2.8,
      );
    }
    // Tiny muzzle sparks
    for (let i = 0; i < 3; i++) {
      this._spawnParticle(
        this._sparkTex,
        this.muzzleWorld,
        this.shootDir
          .clone()
          .multiplyScalar(rand(4, 9))
          .add(new THREE.Vector3(rand(-1.5, 1.5), rand(-0.8, 1.2), rand(-1.5, 1.5))),
        0.08,
        0.035,
        0xffcc66,
        0.4,
      );
    }
  }

  _spawnCasing() {
    this.model.updateWorldMatrix(true, false);
    const eject = this._tmpV.set(0.04, 0.03, -0.02);
    this.model.localToWorld(eject);
    const mesh = new THREE.Mesh(this._casingGeo, this._casingMat);
    mesh.position.copy(eject);
    mesh.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    this.scene.add(mesh);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0);
    const vel = right
      .multiplyScalar(rand(1.6, 2.6))
      .addScaledVector(up, rand(1.2, 2.0))
      .addScaledVector(this.shootDir, rand(-0.2, 0.4));
    this.casings.push({
      mesh,
      vel,
      spin: new THREE.Vector3(rand(-10, 10), rand(-10, 10), rand(-10, 10)),
      life: 0.9,
    });
    if (this.casings.length > 24) {
      const old = this.casings.shift();
      this.scene.remove(old.mesh);
    }
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
    this.recoil += WEAPON.recoilPitch;
    this.recoilYaw += (Math.random() - 0.5) * WEAPON.recoilYaw;
    this.flashT = 0.055;
    this._kickZ = 0.028;
    this.smokeBuildup = Math.min(1.4, this.smokeBuildup + 0.12);
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
    const mesh = new THREE.Mesh(this._tracerGeo, this._tracerMat.clone());
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = Math.max(0.2, dir.length());
    // Short bright streak near muzzle rather than full-distance beam
    const streak = Math.min(len, 3.2 + Math.random() * 1.4);
    const end = from.clone().addScaledVector(dir.normalize(), streak);
    mesh.scale.set(1, 1, streak);
    mesh.position.copy(from).add(end).multiplyScalar(0.5);
    mesh.lookAt(end);
    this.scene.add(mesh);
    this.tracers.push({ mesh, life: WEAPON.tracerLife * 1.35 });
  }

  _spawnBlood(point, dir, headshot) {
    const n = dir.clone().multiplyScalar(-1);
    this._burst(this._bloodTex, point, n, headshot ? 10 : 6, headshot ? 3.2 : 2.2, 0.35, 0.08, 0xaa2211, 1.8);
    this._burst(this._sparkTex, point, n, 2, 2.5, 0.1, 0.04, 0xff6644, 0.5);
  }

  _spawnImpact(point, normal, object) {
    const n = normal
      ? normal.clone().transformDirection(object.matrixWorld).normalize()
      : this.shootDir.clone().multiplyScalar(-1);

    // Hot flash core
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0xffe0a0,
        transparent: true,
        opacity: 0.95,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    core.position.copy(point).addScaledVector(n, 0.03);
    this.scene.add(core);
    this.impacts.push({ mesh: core, life: 0.1, fade: true });

    // Bullet hole decal
    const decal = new THREE.Mesh(
      this._decalGeo,
      new THREE.MeshBasicMaterial({
        color: 0x1a1510,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    );
    decal.position.copy(point).addScaledVector(n, 0.015);
    decal.lookAt(point.clone().add(n));
    this.scene.add(decal);
    this.impacts.push({ mesh: decal, life: 4.5, fade: true });

    // Sparks + dust
    this._burst(this._sparkTex, point, n, 7, 4.5, 0.18, 0.045, 0xffcc66, 0.35);
    this._burst(this._dustTex, point, n, 5, 1.4, 0.55, 0.12, 0xc4b090, 2.2);
  }

  _updateReloadPose(k) {
    // 0–0.35 drop mag, 0.35–0.55 empty, 0.55–1.0 insert + slap
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

    // Tilt weapon down-right while swapping
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
    this.flashSpriteB.visible = flashing;
    if (flashing) {
      this.flashSprite.material.rotation = Math.random() * Math.PI;
      const pulse = 0.2 + this.flashT * 4;
      this.flashSprite.scale.set(pulse, pulse, 1);
      this.flashSpriteB.scale.set(0.1 + pulse * 0.35, 0.28 + pulse * 0.6, 1);
    }
    this.muzzleLight.intensity = flashing ? 16 + Math.random() * 8 : 0;

    void input;
    const adsTarget = this.aiming && canShoot && !this.reloading ? 1 : 0;
    this.ads = lerp(this.ads, adsTarget, 1 - Math.pow(0.00055, dt));

    this._basePos.lerpVectors(this.hipPos, this.adsPos, this.ads);
    // Idle / walk sway (subtle)
    const swayAmp = (1 - this.ads * 0.85) * 0.008;
    this._sway.set(
      Math.sin(this._time * 1.7) * swayAmp,
      Math.cos(this._time * 2.1) * swayAmp * 0.7,
      0,
    );
    this.root.position.copy(this._basePos).add(this._sway);
    this.root.position.z += this._kickZ * (1 - this.ads * 0.4);

    const rx = lerp(this.hipRot.x, this.adsRot.x, this.ads);
    const ry = lerp(this.hipRot.y, this.adsRot.y, this.ads);
    const rz = lerp(this.hipRot.z, this.adsRot.z, this.ads);

    // Soften hands in ADS so they don't clip the optic
    const handFade = 1 - this.ads * 0.55;
    if (this.model.userData.handR) {
      this.model.userData.handR.scale.setScalar(handFade);
      this.model.userData.handL.scale.setScalar(Math.max(0.35, 1 - this.ads * 0.4));
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
      this.root.rotation.x = lerp(this.root.rotation.x, rx - this.recoil * 2.4, 14 * dt);
      this.root.rotation.y = lerp(this.root.rotation.y, ry + this.recoilYaw, 12 * dt);
      this.root.rotation.z = lerp(this.root.rotation.z, rz - this.recoilYaw * 0.5, 12 * dt);
    }

    this.recoil = lerp(this.recoil, 0, 9 * dt);
    this.recoilYaw = lerp(this.recoilYaw, 0, 9 * dt);

    this.camera.fov = lerp(WEAPON.hipFov, WEAPON.adsFov, this.ads);
    this.camera.updateProjectionMatrix();
    this.viewLight.intensity = lerp(2.1, 1.2, this.ads);

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
      t.mesh.material.opacity = Math.max(0, t.life / (WEAPON.tracerLife * 1.35));
      if (t.life <= 0) {
        this.scene.remove(t.mesh);
        t.mesh.material.dispose();
        this.tracers.splice(i, 1);
      }
    }
    for (let i = this.impacts.length - 1; i >= 0; i--) {
      const p = this.impacts[i];
      p.life -= dt;
      if (p.fade && p.mesh.material) {
        p.mesh.material.opacity = Math.max(0, p.mesh.material.opacity * (p.life > 0.5 ? 1 : 0.92));
      } else {
        p.mesh.scale.multiplyScalar(1.06);
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
      p.vel.y -= 1.2 * dt;
      p.vel.multiplyScalar(Math.max(0, 1 - p.drag * dt));
      p.sprite.position.addScaledVector(p.vel, dt);
      const age = 1 - p.life / p.maxLife;
      const s = p.sprite.scale.x * (1 + (p.grow - 1) * dt);
      p.sprite.scale.setScalar(s);
      p.sprite.material.opacity = Math.max(0, (1 - age) * 0.85);
      if (p.life <= 0) {
        this.scene.remove(p.sprite);
        p.sprite.material.dispose();
        this.particles.splice(i, 1);
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
        c.vel.y *= -0.25;
        c.vel.x *= 0.6;
        c.vel.z *= 0.6;
      }
      if (c.life <= 0) {
        this.scene.remove(c.mesh);
        this.casings.splice(i, 1);
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
  }
}
