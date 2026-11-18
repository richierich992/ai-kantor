/* Premium Office World — Phase 2
 * Adds a modern glass-campus shell, department glass partitions, lighting,
 * entrance plaza and a more deliberate default camera frame.
 * The existing scene, room meshes, hit targets and agent paths are untouched.
 */
export function enhanceOfficeWorld({ THREE, scene, camera, controls, zones = [] }) {
  if (scene.userData.premiumWorldPhase2) return;
  scene.userData.premiumWorldPhase2 = true;

  const makeMat = (color, opts = {}) => new THREE.MeshStandardMaterial({
    color, roughness: 0.58, metalness: 0.18, ...opts
  });
  const frameMat = makeMat(0x18334a, { metalness: 0.72, roughness: 0.28 });
  const frameLite = makeMat(0x39718a, { metalness: 0.55, roughness: 0.3 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x74cce0, metalness: 0.12, roughness: 0.2,
    transparent: true, opacity: 0.13, side: THREE.DoubleSide,
    depthWrite: false
  });
  const glassDoorMat = new THREE.MeshPhysicalMaterial({
    color: 0x8ce8f0, metalness: 0.18, roughness: 0.16,
    transparent: true, opacity: 0.2, side: THREE.DoubleSide,
    depthWrite: false
  });
  const glow = (color, intensity = 1.25) => new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: intensity,
    roughness: 0.38, metalness: 0.15
  });
  const cyanGlow = glow(0x5edce8, 1.15);
  const mintGlow = glow(0x66e3c4, 0.85);

  function block(w, h, d, x, y, z, material, parent = scene, shadow = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = shadow && !material.transparent;
    mesh.receiveShadow = shadow && !material.transparent;
    parent.add(mesh);
    return mesh;
  }

  function signTexture(title, subtitle) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 1024, 256);
    grad.addColorStop(0, '#102b43');
    grad.addColorStop(1, '#174b61');
    ctx.fillStyle = grad;
    ctx.roundRect(4, 4, 1016, 248, 34);
    ctx.fill();
    ctx.strokeStyle = 'rgba(112,225,236,.7)';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f0fbff';
    ctx.font = '800 76px Nunito, system-ui, sans-serif';
    ctx.fillText(title, 512, 103, 920);
    ctx.fillStyle = '#9fd8e4';
    ctx.font = '600 30px Nunito, system-ui, sans-serif';
    ctx.fillText(subtitle, 512, 181, 920);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    return map;
  }

  /* Campus foundation and clean entrance promenade */
  const plinthMat = makeMat(0x253b4d, { metalness: 0.48, roughness: 0.42 });
  const pavingMat = makeMat(0x506a78, { roughness: 0.86, metalness: 0.04 });
  const tileMatA = makeMat(0x718896, { roughness: 0.82, metalness: 0.05 });
  const tileMatB = makeMat(0x607b89, { roughness: 0.82, metalness: 0.05 });
  block(88.8, 0.22, 47.8, 0, -0.77, -4.5, plinthMat, scene, false);
  block(11.5, 0.09, 13.2, 0, -0.425, 25.1, pavingMat, scene, false);
  for (let i = 0; i < 8; i++) {
    block(1.18, 0.018, 1.42, 0, -0.371, 19.15 + i * 1.55,
      i % 2 ? tileMatA : tileMatB, scene, false);
  }
  block(0.12, 0.025, 11.5, -5.35, -0.365, 25.0, cyanGlow, scene, false);
  block(0.12, 0.025, 11.5, 5.35, -0.365, 25.0, cyanGlow, scene, false);

  /* Glazed perimeter façade with an open front gateway */
  const sideGlass = block(0.13, 3.5, 43.2, -42.12, 1.7, -4.5, glassMat, scene, false);
  const sideGlassR = block(0.13, 3.5, 43.2, 42.12, 1.7, -4.5, glassMat, scene, false);
  const backGlass = block(83.8, 3.5, 0.13, 0, 1.7, -28.08, glassMat, scene, false);
  const frontGlassL = block(36.6, 3.5, 0.13, -23.7, 1.7, 18.98, glassMat, scene, false);
  const frontGlassR = block(36.6, 3.5, 0.13, 23.7, 1.7, 18.98, glassMat, scene, false);
  [sideGlass, sideGlassR, backGlass, frontGlassL, frontGlassR].forEach(m => {
    m.renderOrder = 2;
  });

  /* Structural columns and a continuous illuminated roofline */
  const zPosts = [-26, -17, -8, 1, 10, 18.5];
  [-42.15, 42.15].forEach(x => {
    zPosts.forEach(z => block(0.42, 4.15, 0.42, x, 2.05, z, frameMat));
    block(0.2, 0.16, 43.4, x, 3.86, -4.5, frameLite);
    block(0.08, 0.08, 43.0, x, 3.96, -4.5, cyanGlow, scene, false);
  });
  [-42, -5.5, 5.5, 42].forEach(x =>
    block(0.4, 4.1, 0.4, x, 2.05, 18.9, frameMat)
  );
  block(84.4, 0.34, 0.42, 0, 3.9, -28.15, frameMat);
  block(36.9, 0.28, 0.42, -23.7, 3.9, 19.0, frameMat);
  block(36.9, 0.28, 0.42, 23.7, 3.9, 19.0, frameMat);
  block(84.4, 0.34, 0.42, 0, 3.9, -4.5, frameLite);
  block(0.08, 0.08, 43.0, 0, 4.1, -4.5, cyanGlow, scene, false);

  /* Distinctive entrance canopy and translucent sliding doors */
  block(14.2, 0.58, 5.1, 0, 4.5, 20.5, frameMat);
  block(13.5, 0.09, 4.5, 0, 4.18, 20.5, frameLite);
  block(12.8, 0.065, 0.12, 0, 4.12, 22.82, cyanGlow, scene, false);
  block(1.95, 3.05, 0.11, -2.02, 1.55, 19.02, glassDoorMat, scene, false);
  block(1.95, 3.05, 0.11, 2.02, 1.55, 19.02, glassDoorMat, scene, false);
  [-4.15, 4.15].forEach(x => block(0.18, 3.35, 0.2, x, 1.68, 19.0, frameLite));
  block(0.1, 3.0, 0.13, 0, 1.55, 19.0, cyanGlow, scene, false);

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(10.2, 2.15),
    new THREE.MeshBasicMaterial({
      map: signTexture('GOSHEN  /  AI OFFICE', 'AUTONOMOUS WORKSPACE  •  5 DIVISIONS'),
      transparent: true, toneMapped: false, side: THREE.DoubleSide
    })
  );
  sign.position.set(0, 6.0, 19.18);
  scene.add(sign);

  /* Hide the old white entry parapets and billboard so the new glazed portal
     reads as one clean architectural composition instead of two stacked gates. */
  scene.children.forEach(object => {
    if (object.isSprite &&
        Math.abs(object.position.x) < 0.2 &&
        Math.abs(object.position.y - 5.7) < 0.25 &&
        Math.abs(object.position.z - 17) < 0.4) {
      object.visible = false;
    }
    const p = object.geometry && object.geometry.parameters;
    if (!object.isMesh || !p) return;
    const oldLowWall = Math.abs((p.width || 0) - 36.6) < 0.1 &&
      Math.abs((p.height || 0) - 1) < 0.1 &&
      Math.abs((p.depth || 0) - 0.5) < 0.1 &&
      Math.abs(object.position.y - 0.5) < 0.1 &&
      Math.abs(object.position.z - 17) < 0.2;
    const oldGatePost = Math.abs((p.width || 0) - 0.6) < 0.1 &&
      Math.abs((p.height || 0) - 4) < 0.1 &&
      Math.abs((p.depth || 0) - 0.6) < 0.1 &&
      Math.abs(Math.abs(object.position.x) - 5.4) < 0.2 &&
      Math.abs(object.position.z - 17) < 0.2;
    const oldGateBeam = Math.abs((p.width || 0) - 11.4) < 0.1 &&
      Math.abs((p.height || 0) - 0.6) < 0.1 &&
      Math.abs((p.depth || 0) - 0.6) < 0.1 &&
      Math.abs(object.position.y - 4.2) < 0.2 &&
      Math.abs(object.position.z - 17) < 0.2;
    if (oldLowWall || oldGatePost || oldGateBeam) object.visible = false;
  });

  /* Glass office partitions, lit thresholds and slim coloured mullions */
  const zoneGlow = {
    finance: 0x53d68b,
    marketing_content: 0xf08b9b,
    it_automation: 0x64b8e8,
    research_intelligence: 0x8aa8ff,
    hr_admin: 0xc49be8
  };
  zones.forEach(zone => {
    const b = zone.box;
    if (!Array.isArray(b) || b.length !== 4) return;
    const [x0, x1, z0, z1] = b;
    const w = x1 - x0;
    const d = z1 - z0;
    const cx = (x0 + x1) / 2;
    const cz = (z0 + z1) / 2;
    const accentColor = zoneGlow[zone.id] || 0x63d9eb;
    const accent = glow(accentColor, 0.7);
    const door = Math.min(3.8, Math.max(2.6, w * 0.34));
    const segment = Math.max(0.2, (w - door) / 2);
    const panelY = 1.88;
    const panelH = 2.55;

    block(0.1, panelH, d, x0 + 0.04, panelY, cz, glassMat, scene, false);
    block(0.1, panelH, d, x1 - 0.04, panelY, cz, glassMat, scene, false);
    block(w, panelH, 0.1, cx, panelY, z0 + 0.04, glassMat, scene, false);
    block(segment, panelH, 0.1, x0 + segment / 2, panelY, z1 - 0.04, glassMat, scene, false);
    block(segment, panelH, 0.1, x1 - segment / 2, panelY, z1 - 0.04, glassMat, scene, false);

    block(w, 0.12, 0.16, cx, 3.22, z0, frameLite);
    block(0.16, 0.12, d, x0, 3.22, cz, frameLite);
    block(0.16, 0.12, d, x1, 3.22, cz, frameLite);
    block(segment, 0.1, 0.14, x0 + segment / 2, 3.22, z1, frameLite);
    block(segment, 0.1, 0.14, x1 - segment / 2, 3.22, z1, frameLite);

    block(w - 0.25, 0.045, 0.1, cx, 0.15, z0 + 0.18, accent, scene, false);
    block(w - 0.25, 0.045, 0.1, cx, 0.15, z1 - 0.18, accent, scene, false);
    block(0.1, 0.045, d - 0.25, x0 + 0.18, 0.15, cz, accent, scene, false);
    block(0.1, 0.045, d - 0.25, x1 - 0.18, 0.15, cz, accent, scene, false);
    block(0.12, panelH, 0.12, cx - door / 2, panelY, z1, accent, scene, false);
    block(0.12, panelH, 0.12, cx + door / 2, panelY, z1, accent, scene, false);

    const finCount = Math.max(1, Math.floor(d / 5));
    for (let i = 1; i < finCount; i++) {
      const z = z0 + (d / finCount) * i;
      block(0.055, panelH, 0.12, x0 + 0.04, panelY, z, frameLite, scene, false);
      block(0.055, panelH, 0.12, x1 - 0.04, panelY, z, frameLite, scene, false);
    }

  });

  /* Subtle architectural lighting and planted entrance edges */
  const entryLight = new THREE.PointLight(0x65ddea, 2.2, 30, 2);
  entryLight.position.set(0, 5.2, 22.5);
  entryLight.castShadow = false;
  scene.add(entryLight);
  const warmFill = new THREE.PointLight(0xf5d39b, 1.1, 46, 2);
  warmFill.position.set(0, 8, -7);
  warmFill.castShadow = false;
  scene.add(warmFill);

  const planterMat = makeMat(0x263e4d, { roughness: 0.84 });
  const planterTop = makeMat(0x36564c, { roughness: 0.95 });
  [-36, 36].forEach(x => {
    block(4.2, 0.55, 1.5, x, -0.12, 21.8, planterMat, scene, false);
    block(3.95, 0.08, 1.27, x, 0.19, 21.8, planterTop, scene, false);
    for (let i = 0; i < 3; i++) {
      const shrub = new THREE.Mesh(
        new THREE.SphereGeometry(0.62, 12, 10),
        makeMat(i % 2 ? 0x4d9b78 : 0x397d68, { roughness: 0.92 })
      );
      shrub.position.set(x - 1.15 + i * 1.15, 0.73, 21.8);
      shrub.scale.set(1.15, 0.82, 0.9);
      shrub.castShadow = true;
      scene.add(shrub);
    }
  });

  /* Phase 6 — visual QA refinements.
     Large ground planes should not receive the directional-light shadow frustum:
     this avoids broad diagonal shadow artifacts across the diorama floor. */
  const groundMesh = scene.children.find(object => {
    const p = object.geometry && object.geometry.parameters;
    return object.isMesh && p && p.width === 420 && p.depth === 300;
  });
  if (groundMesh) {
    if (groundMesh.material && groundMesh.material.color) {
      groundMesh.material = groundMesh.material.clone();
      groundMesh.material.color.setHex(0x61766c);
    }
    groundMesh.receiveShadow = false;
    groundMesh.castShadow = false;
  }

  const officeFloor = scene.children.find(object => {
    const p = object.geometry && object.geometry.parameters;
    return object.isMesh && object.geometry.type === 'PlaneGeometry' &&
      p && p.width === 84 && p.height === 43;
  });
  if (officeFloor) {
    officeFloor.receiveShadow = false;
    officeFloor.castShadow = false;
  }

  /* Widen the shadow camera for the smaller architectural objects that still
     benefit from contact shadows, avoiding a hard edge at the old frustum. */
  scene.traverse(object => {
    if (!object.isDirectionalLight || !object.castShadow || !object.shadow) return;
    const shadowCamera = object.shadow.camera;
    shadowCamera.left = -92;
    shadowCamera.right = 92;
    shadowCamera.top = 82;
    shadowCamera.bottom = -82;
    shadowCamera.near = 1;
    shadowCamera.far = 240;
    object.shadow.bias = -0.00025;
    object.shadow.normalBias = 0.025;
    shadowCamera.updateProjectionMatrix();
  });

  /* Upgrade the original sharp cone trees to layered low-poly canopies. */
  const canopyGeometry = new THREE.IcosahedronGeometry(1.45, 1);
  const canopyMaterials = [
    makeMat(0x286b58, { roughness: 0.92 }),
    makeMat(0x347b63, { roughness: 0.92 }),
    makeMat(0x43866a, { roughness: 0.92 })
  ];
  const oldTreeCones = [];
  scene.traverse(object => {
    const p = object.geometry && object.geometry.parameters;
    if (object.isMesh && object.geometry.type === 'ConeGeometry' &&
        p && Math.abs((p.radius || 0) - 2.2) < 0.01 &&
        Math.abs((p.height || 0) - 5) < 0.01) oldTreeCones.push(object);
  });
  oldTreeCones.forEach((oldCone, index) => {
    oldCone.visible = false;
    const x = oldCone.position.x;
    const z = oldCone.position.z;
    const crown = new THREE.Group();
    crown.position.set(x, 0, z);
    const levels = [
      { y: 3.35, scale: [1.05, 0.92, 1.05], offset: [0, 0, 0] },
      { y: 4.25, scale: [0.88, 0.9, 0.88], offset: [0.12, 0, -0.06] },
      { y: 5.05, scale: [0.68, 0.78, 0.68], offset: [-0.08, 0, 0.08] }
    ];
    levels.forEach((level, i) => {
      const leaves = new THREE.Mesh(canopyGeometry, canopyMaterials[(index + i) % canopyMaterials.length]);
      leaves.position.set(level.offset[0], level.y, level.offset[2]);
      leaves.scale.set(...level.scale);
      leaves.castShadow = false;
      leaves.receiveShadow = false;
      crown.add(leaves);
    });
    scene.add(crown);
  });

  /* Refined twilight sky for the diorama; ground and office meshes remain unchanged. */
  const sky = document.createElement('canvas');
  sky.width = 8;
  sky.height = 256;
  const ctx = sky.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#10263f');
  gradient.addColorStop(0.42, '#315f78');
  gradient.addColorStop(0.78, '#83aeb9');
  gradient.addColorStop(1, '#c4d8d2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 8, 256);
  const skyMap = new THREE.CanvasTexture(sky);
  skyMap.colorSpace = THREE.SRGBColorSpace;
  scene.background = skyMap;
  if (scene.fog) {
    scene.fog.color.set(0x9cbec1);
    scene.fog.near = 180;
    scene.fog.far = 390;
  }

  /* Framing centres the building while leaving the side HUD readable. */
  const portraitView = camera.aspect < 0.85;
  camera.fov = portraitView ? 50 : 40;
  camera.zoom = portraitView ? 1.28 : 1.08;
  camera.position.set(
    portraitView ? 16 : 27,
    portraitView ? 65 : 38,
    portraitView ? 88 : 51
  );
  camera.updateProjectionMatrix();
  controls.target.set(0, 1, -5);
  controls.minDistance = 7;
  controls.maxDistance = 185;
  controls.maxPolarAngle = 1.38;
  controls.update();

  return { foundation: true, glazedZones: zones.length };
}
