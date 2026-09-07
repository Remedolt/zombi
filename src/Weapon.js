import * as THREE from 'three';
import { WEAPON, COMBAT, lerp } from './constants.js';

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

function buildAssaultRifle() {
  const root = new THREE.Group();
  const dark = steel(0x1a1d22, { roughness: 0.34, metalness: 0.88, clearcoat: 0.2 });
  const gun = steel(0x3a414c, { roughness: 0.32, metalness: 0.9 });
  const blued = steel(0x12151a, { roughness: 0.22, metalness: 0.95, clearcoat: 0.55 });
  const poly = polymer(0x1c1e1a);
  const gripMat = polymer(0x151710, { roughness: 0.9 });
  const magCol = polymer(0x2a3222, { roughness: 0.78, metalness: 0.12 });
  const brass = steel(0xb08a3a, { roughness: 0.4, metalness: 0.85, clearcoat: 0.15 });

  // Lower + upper receiver
  addBox(root, 0.052, 0.062, 0.3, gun, 0, 0.008, 0.01);
  addBox(root, 0.046, 0.038, 0.27, dark, 0, 0.052, -0.01);
  addBox(root, 0.056, 0.018, 0.12, gun, 0, -0.028, 0.02); // mag well flare
  addBox(root, 0.042, 0.028, 0.055, gun, 0, -0.038, -0.015); // mag well

  // Ejection port / dust cover
  addBox(root, 0.004, 0.028, 0.07, blued, 0.027, 0.03, -0.02);

  // Charging handle
  addBox(root, 0.05, 0.01, 0.018, dark, 0, 0.072, 0.1);
  addBox(root, 0.012, 0.014, 0.03, dark, 0, 0.072, 0.118);

  // Picatinny rail (segmented)
  for (let i = 0; i < 11; i++) {
    addBox(root, 0.028, 0.01, 0.012, blued, 0, 0.078, 0.08 - i * 0.022);
  }
  addBox(root, 0.022, 0.006, 0.24, dark, 0, 0.072, -0.03);

  // Barrel assembly
  addCyl(root, 0.011, 0.012, 0.38, 12, blued, 0, 0.018, -0.34, Math.PI / 2, 0, 0);
  addCyl(root, 0.015, 0.015, 0.04, 10, dark, 0, 0.018, -0.16, Math.PI / 2, 0, 0); // barrel nut
  addCyl(root, 0.007, 0.007, 0.2, 8, dark, 0, 0.04, -0.26, Math.PI / 2, 0, 0); // gas tube
  addBox(root, 0.022, 0.02, 0.03, dark, 0, 0.04, -0.18); // gas block

  // Handguard with vents
  addBox(root, 0.048, 0.042, 0.2, dark, 0, 0.01, -0.2);
  for (let i = 0; i < 5; i++) {
    addBox(root, 0.006, 0.016, 0.028, blued, 0.026, 0.01, -0.12 - i * 0.028);
    addBox(root, 0.006, 0.016, 0.028, blued, -0.026, 0.01, -0.12 - i * 0.028);
  }
  addBox(root, 0.046, 0.008, 0.18, dark, 0, -0.014, -0.2); // bottom rail

  // Flash hider / muzzle brake
  addCyl(root, 0.014, 0.016, 0.048, 10, blued, 0, 0.018, -0.55, Math.PI / 2, 0, 0);
  for (const ang of [-0.55, 0, 0.55]) {
    const slot = addBox(root, 0.006, 0.018, 0.022, blued, 0, 0.018, -0.565);
    slot.rotation.z = ang;
  }

  // Stock + buffer tube
  addCyl(root, 0.016, 0.016, 0.14, 10, dark, 0, 0.02, 0.2, Math.PI / 2, 0, 0);
  addBox(root, 0.042, 0.068, 0.14, poly, 0, -0.002, 0.26);
  addBox(root, 0.048, 0.082, 0.028, gripMat, 0, -0.01, 0.335); // buttpad
  addBox(root, 0.038, 0.02, 0.08, poly, 0, 0.04, 0.27); // cheek weld

  // Pistol grip
  const grip = addBox(root, 0.03, 0.105, 0.036, gripMat, 0, -0.082, 0.055, 0.38, 0, 0);
  for (let i = 0; i < 4; i++) {
    addBox(grip, 0.032, 0.006, 0.034, polymer(0x0e100c), 0, -0.03 + i * 0.022, 0);
  }

  // Trigger + guard
  addBox(root, 0.028, 0.004, 0.05, dark, 0, -0.035, 0.05);
  addBox(root, 0.004, 0.028, 0.004, dark, 0, -0.048, 0.068);
  addBox(root, 0.004, 0.028, 0.004, dark, 0, -0.048, 0.032);
  addBox(root, 0.006, 0.018, 0.01, blued, 0, -0.042, 0.05, 0.25, 0, 0);

  // Magazine
  const mag = addBox(root, 0.03, 0.14, 0.048, magCol, 0, -0.118, -0.012, 0.12, 0, 0);
  for (let i = 0; i < 6; i++) {
    addBox(mag, 0.032, 0.004, 0.046, polymer(0x1e2418), 0, -0.05 + i * 0.02, 0);
  }
  addBox(mag, 0.028, 0.012, 0.046, brass, 0, -0.065, 0); // follower hint

  // Front sight post + rear optic
  addBox(root, 0.014, 0.04, 0.014, dark, 0, 0.055, -0.42);
  addBox(root, 0.004, 0.02, 0.004, blued, 0, 0.078, -0.42);

  const optic = addBox(root, 0.034, 0.034, 0.055, dark, 0, 0.1, 0.015);
  addCyl(optic, 0.012, 0.012, 0.02, 12, steel(0x0a1018, { roughness: 0.15, metalness: 0.4, transparent: true, opacity: 0.55 }), 0, 0.004, 0.02, Math.PI / 2, 0, 0);
  const reticle = new THREE.Mesh(
    new THREE.CircleGeometry(0.0035, 10),
    new THREE.MeshBasicMaterial({ color: 0xff2a2a, fog: false, toneMapped: false }),
  );
  reticle.position.set(0, 0.104, 0.04);
  root.add(reticle);
  const glow = new THREE.Mesh(
    new THREE.RingGeometry(0.005, 0.009, 16),
    new THREE.MeshBasicMaterial({ color: 0xff4444, fog: false, transparent: true, opacity: 0.55, toneMapped: false }),
  );
  glow.position.copy(reticle.position);
  glow.position.z += 0.001;
  root.add(glow);

  // Forward assist / bolt catch accents
  addBox(root, 0.012, 0.016, 0.016, dark, -0.03, 0.02, 0.06);
  addBox(root, 0.01, 0.014, 0.012, dark, 0.03, -0.01, 0.02);

  // Gloves / hands
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
  addBox(handR, 0.014, 0.014, 0.024, glove, 0.022, 0.002, -0.02, 0, 0, 0.7); // thumb
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

  root.userData.muzzleLocal = new THREE.Vector3(0, 0.018, -0.58);
  root.userData.magazine = mag;
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
    this.root.position.set(0.22, -0.24, -0.48);
    this.root.rotation.set(0.03, 0.06, -0.015);
    this.root.scale.setScalar(1.12);
    camera.add(this.root);

    this.viewLight = new THREE.PointLight(0xffe8d0, 2.4, 1.4, 1.6);
    this.viewLight.position.set(0.02, 0.16, 0.18);
    this.root.add(this.viewLight);

    this.flashSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: flashTexture(),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    this.flashSprite.scale.set(0.28, 0.28, 1);
    this.flashSprite.visible = false;
    this.flashSprite.position.copy(this.model.userData.muzzleLocal || new THREE.Vector3(0, 0.018, -0.58));
    this.model.add(this.flashSprite);

    this.muzzleLight = new THREE.PointLight(0xffb060, 0, 10, 2);
    this.muzzleLight.position.copy(this.flashSprite.position);
    this.model.add(this.muzzleLight);

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = WEAPON.range;
    this.shootOrigin = new THREE.Vector3();
    this.shootDir = new THREE.Vector3();
    this.hitPoint = new THREE.Vector3();
    this.muzzleWorld = new THREE.Vector3();

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

    this.tracers = [];
    this.impacts = [];
    this._tracerGeo = new THREE.CylinderGeometry(0.008, 0.004, 1, 6);
    this._tracerGeo.rotateX(Math.PI / 2);
    this._tracerMat = new THREE.MeshBasicMaterial({
      color: 0xffc060,
      transparent: true,
      opacity: 0.9,
      toneMapped: false,
    });

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
    this.clearEffects();
  }

  clearEffects() {
    for (const t of this.tracers) this.scene.remove(t.mesh);
    for (const i of this.impacts) this.scene.remove(i.mesh);
    this.tracers.length = 0;
    this.impacts.length = 0;
  }

  tryReload() {
    if (this.reloading || this.mag >= WEAPON.magSize || this.reserve <= 0) return;
    this.reloading = true;
    this.reloadT = 0;
    this.sound.reload();
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
    this.flashT = 0.05;
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
      }
    } else if (worldHit) {
      this.hitPoint.copy(worldHit.point);
      this._spawnTracer(this.muzzleWorld, worldHit.point);
      const barrel = worldHit.object.userData.barrel;
      if (barrel && !barrel.exploded) {
        result.blast = this.world.explodeBarrel(barrel);
      } else {
        this._spawnImpact(worldHit.point, worldHit.face?.normal);
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
    mesh.scale.set(1, 1, len);
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.lookAt(to);
    this.scene.add(mesh);
    this.tracers.push({ mesh, life: WEAPON.tracerLife });
  }

  _spawnImpact(point, normal) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffd090,
        emissive: 0xff8822,
        emissiveIntensity: 1.4,
        roughness: 0.4,
        metalness: 0.2,
      }),
    );
    mesh.position.copy(point);
    if (normal) mesh.position.addScaledVector(normal, 0.04);
    this.scene.add(mesh);
    this.impacts.push({ mesh, life: 0.14 });
  }

  update(dt, input, canShoot, zombies) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.flashT = Math.max(0, this.flashT - dt);
    this.flashSprite.visible = this.flashT > 0;
    this.flashSprite.material.rotation = Math.random() * Math.PI;
    this.muzzleLight.intensity = this.flashT > 0 ? 18 : 0;

    void input;
    const adsTarget = this.aiming && canShoot && !this.reloading ? 1 : 0;
    this.ads = lerp(this.ads, adsTarget, 1 - Math.pow(0.0008, dt));

    const hip = new THREE.Vector3(0.21, -0.25, -0.5);
    const ads = new THREE.Vector3(0.0, -0.2, -0.38);
    this.root.position.lerpVectors(hip, ads, this.ads);

    if (this.reloading) {
      this.reloadT += dt;
      const k = this.reloadT / WEAPON.reloadTime;
      this.root.rotation.x = Math.sin(Math.min(k, 1) * Math.PI) * 0.35;
      if (this.model.userData.magazine) {
        this.model.userData.magazine.position.y = -0.12 - Math.sin(Math.min(k, 1) * Math.PI) * 0.08;
      }
      if (this.reloadT >= WEAPON.reloadTime) {
        const need = WEAPON.magSize - this.mag;
        const take = Math.min(need, this.reserve);
        this.mag += take;
        this.reserve -= take;
        this.reloading = false;
        this.reloadT = 0;
        this.root.rotation.x = 0;
      }
    } else {
      this.root.rotation.x = lerp(this.root.rotation.x, -this.recoil * 2.2, 12 * dt);
      this.root.rotation.y = lerp(this.root.rotation.y, this.recoilYaw, 10 * dt);
    }

    this.recoil = lerp(this.recoil, 0, 8 * dt);
    this.recoilYaw = lerp(this.recoilYaw, 0, 8 * dt);

    this.camera.fov = lerp(WEAPON.hipFov, WEAPON.adsFov, this.ads);
    this.camera.updateProjectionMatrix();

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
      t.mesh.material.opacity = Math.max(0, t.life / WEAPON.tracerLife);
      if (t.life <= 0) {
        this.scene.remove(t.mesh);
        t.mesh.material.dispose();
        this.tracers.splice(i, 1);
      }
    }
    for (let i = this.impacts.length - 1; i >= 0; i--) {
      const p = this.impacts[i];
      p.life -= dt;
      p.mesh.scale.multiplyScalar(1.08);
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.impacts.splice(i, 1);
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
