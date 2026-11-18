/* Premium Campus Architecture — Phase 13
 * Re-composes the existing 5-division office as a coherent AI campus.
 * All geometry is additive: legacy room groups, hit targets, agent IDs,
 * movement paths, Firebase and backend contracts remain unchanged.
 */

const STYLE = {
  finance: { color: 0xe3ad4c, dark: 0x5c3b16, title: "KEUANGAN & INVESTASI", sub: "TRADING • PORTOFOLIO • FINANCE" },
  marketing_content: { color: 0xef7caa, dark: 0x71334f, title: "MARKETING & KREATIF", sub: "VIDEO • DESAIN • KOMERSIAL" },
  it_automation: { color: 0x55b9e8, dark: 0x174e6b, title: "IT & OTOMASI", sub: "CODING • AI • SYSTEMS" },
  research_intelligence: { color: 0x65d6c4, dark: 0x17584f, title: "RISET & INTELIJEN", sub: "DATA • TREN • INSIGHT" },
  hr_admin: { color: 0xb99ae8, dark: 0x49366b, title: "HR & ADMINISTRASI", sub: "PEOPLE • DOKUMEN • SUPPORT" }
};

function material(THREE, color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness: 0.48, metalness: 0.38, ...options
  });
}

function block(THREE, parent, width, height, depth, x, y, z, mat, shadow = false) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = shadow;
  mesh.receiveShadow = shadow;
  parent.add(mesh);
  return mesh;
}

function textSprite(THREE, title, subtitle, accent, width = 9.2) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(7,22,37,.94)";
  ctx.beginPath();
  ctx.roundRect(12, 12, 1000, 232, 38);
  ctx.fill();
  ctx.strokeStyle = "#" + new THREE.Color(accent).getHexString();
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.fillStyle = "#" + new THREE.Color(accent).getHexString();
  ctx.fillRect(34, 44, 12, 168);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#f3f9ff";
  ctx.font = "900 48px Nunito, system-ui, sans-serif";
  ctx.fillText(title, 76, 105, 900);
  ctx.fillStyle = "#a9c5d8";
  ctx.font = "800 25px system-ui, sans-serif";
  ctx.fillText(subtitle, 78, 177, 900);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture, transparent: true, depthTest: true, depthWrite: false
  }));
  sprite.scale.set(width, width * 0.25, 1);
  sprite.renderOrder = 18;
  return sprite;
}

function createDepartmentPod(THREE, root, zone, index) {
  const spec = STYLE[zone.id] || STYLE.it_automation;
  const [x0, x1, z0, z1] = zone.box;
  const width = x1 - x0;
  const depth = z1 - z0;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  if (width < 5 || depth < 5) return null;

  const frame = material(THREE, 0x1c3548, { metalness: 0.72, roughness: 0.3 });
  const accent = material(THREE, spec.color, {
    emissive: spec.color, emissiveIntensity: 0.5, metalness: 0.48, roughness: 0.32
  });
  const accentSoft = material(THREE, spec.dark, {
    emissive: spec.color, emissiveIntensity: 0.12, roughness: 0.64
  });
  const roofGlass = new THREE.MeshPhysicalMaterial({
    color: spec.color, metalness: 0.18, roughness: 0.24,
    transparent: true, opacity: 0.075, side: THREE.DoubleSide, depthWrite: false
  });

  // A crisp raised-looking perimeter trim defines each division as a distinct pod.
  const yTrim = 0.205;
  block(THREE, root, width - 0.4, 0.055, 0.12, cx, yTrim, z0 + 0.12, accent);
  block(THREE, root, width - 0.4, 0.055, 0.12, cx, yTrim, z1 - 0.12, accent);
  block(THREE, root, 0.12, 0.055, depth - 0.4, x0 + 0.12, yTrim, cz, accent);
  block(THREE, root, 0.12, 0.055, depth - 0.4, x1 - 0.12, yTrim, cz, accent);

  // Four structural corners and a floating glass/pergola canopy make the room read as architecture.
  const corners = [[x0 + 0.14, z0 + 0.14], [x1 - 0.14, z0 + 0.14],
    [x0 + 0.14, z1 - 0.14], [x1 - 0.14, z1 - 0.14]];
  corners.forEach(([x, z]) => {
    block(THREE, root, 0.25, 3.65, 0.25, x, 1.82, z, frame, true);
    block(THREE, root, 0.31, 0.11, 0.31, x, 3.68, z, accent);
  });
  block(THREE, root, width + 0.2, 0.18, 0.2, cx, 3.72, z0, frame);
  block(THREE, root, width + 0.2, 0.18, 0.2, cx, 3.72, z1, frame);
  block(THREE, root, 0.2, 0.18, depth + 0.2, x0, 3.72, cz, frame);
  block(THREE, root, 0.2, 0.18, depth + 0.2, x1, 3.72, cz, frame);

  // Transparent roof lights are split into panels so the workstations remain visible from above.
  const roofDepth = Math.max(2, (depth - 0.7) * 0.32);
  [-0.24, 0.24].forEach(offset => {
    const z = cz + depth * offset;
    const glass = block(THREE, root, width - 0.65, 0.035, roofDepth,
      cx, 3.79, z, roofGlass);
    glass.renderOrder = 3;
  });
  const slats = Math.max(2, Math.min(5, Math.floor(depth / 4)));
  for (let i = 1; i < slats; i++) {
    const z = z0 + (depth / slats) * i;
    block(THREE, root, width - 0.35, 0.055, 0.085, cx, 3.84, z, accentSoft);
  }

  // Branded entrance portal facing the shared plaza, without closing the existing doorway.
  const doorWidth = Math.min(5.2, Math.max(3, width * 0.36));
  const frontZ = z1 + 0.13;
  const postX = [cx - doorWidth / 2, cx + doorWidth / 2];
  postX.forEach(x => {
    block(THREE, root, 0.22, 3.25, 0.25, x, 1.72, frontZ, accent, true);
    block(THREE, root, 0.34, 0.13, 0.34, x, 3.39, frontZ, accent);
  });
  block(THREE, root, doorWidth + 0.42, 0.2, 0.28, cx, 3.36, frontZ, frame);
  block(THREE, root, doorWidth + 0.15, 0.045, 0.12, cx, 3.47, frontZ, accent);

  const label = textSprite(THREE, spec.title, spec.sub, spec.color,
    Math.min(10.2, Math.max(6.0, width * 0.55)));
  label.position.set(cx, 4.62, frontZ + 0.03);
  root.add(label);

  // Back-wall light panels differentiate the room even at the wide overview camera.
  const panelWidth = Math.min(width - 1.2, Math.max(2.8, width * 0.42));
  block(THREE, root, panelWidth, 1.15, 0.09, cx, 2.14, z0 + 0.23, accentSoft);
  block(THREE, root, panelWidth - 0.3, 0.055, 0.12, cx, 2.78, z0 + 0.15, accent);

  // Accent lights at the front corners provide a readable entrance at night.
  const lampMat = new THREE.MeshBasicMaterial({ color: spec.color });
  [-1, 1].forEach(side => {
    const light = new THREE.PointLight(spec.color, 0.75, 12, 2);
    light.position.set(cx + side * (doorWidth / 2 + 0.8), 2.8, frontZ + 0.65);
    light.castShadow = false;
    root.add(light);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), lampMat);
    lamp.position.copy(light.position);
    root.add(lamp);
  });

  return { id: zone.id, label, color: spec.color, center: [cx, cz], box: zone.box.slice(), index };
}

function createCentralCore(THREE, root) {
  const core = new THREE.Group();
  core.name = "premium-ai-core";
  core.position.set(0, 0, 4.7);
  root.add(core);

  const darkMetal = material(THREE, 0x183247, { metalness: 0.82, roughness: 0.24 });
  const steel = material(THREE, 0x47728b, { metalness: 0.75, roughness: 0.28 });
  const cyan = material(THREE, 0x52ddec, {
    emissive: 0x1b9db9, emissiveIntensity: 1.0, metalness: 0.4, roughness: 0.25
  });
  const mint = material(THREE, 0x72e4c4, {
    emissive: 0x1b9d7f, emissiveIntensity: 0.65, metalness: 0.35, roughness: 0.26
  });

  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(6.9, 7.35, 0.38, 64), darkMetal);
  plinth.position.y = 0.13;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  core.add(plinth);
  const upper = new THREE.Mesh(new THREE.CylinderGeometry(5.95, 6.25, 0.22, 64), steel);
  upper.position.y = 0.42;
  upper.castShadow = true;
  core.add(upper);

  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(6.82, 0.095, 10, 96), cyan);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.36;
  core.add(baseRing);
  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(5.82, 0.045, 8, 96), mint);
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = 0.56;
  core.add(innerRing);

  // Radial floor marks make the central hub read as the campus' shared command node.
  for (let i = 0; i < 12; i++) {
    const angle = i / 12 * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.026, 1.0),
      new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0x86f0df : 0x4dbfdb,
        transparent: true, opacity: 0.62 }));
    spoke.position.set(Math.cos(angle) * 3.55, 0.56, Math.sin(angle) * 3.55);
    spoke.rotation.y = angle;
    core.add(spoke);
  }

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 2.1, 1.12, 32), darkMetal);
  pedestal.position.y = 1.04;
  core.add(pedestal);
  const orbMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x82e8fa, emissive: 0x137a9b, emissiveIntensity: 0.95,
    metalness: 0.18, roughness: 0.18, transparent: true, opacity: 0.84,
    clearcoat: 1, clearcoatRoughness: 0.12
  });
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1.58, 3), orbMaterial);
  orb.position.y = 3.28;
  orb.castShadow = false;
  core.add(orb);
  const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.66, 2),
    new THREE.MeshBasicMaterial({ color: 0x8af3ff, wireframe: true, transparent: true, opacity: 0.28 }));
  wire.position.copy(orb.position);
  core.add(wire);

  const haloA = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.055, 10, 80), cyan);
  haloA.position.y = 3.18;
  haloA.rotation.x = Math.PI / 2;
  core.add(haloA);
  const haloB = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.045, 10, 80), mint);
  haloB.position.y = 3.28;
  haloB.rotation.set(0.95, 0.2, 0.45);
  core.add(haloB);
  const haloC = new THREE.Mesh(new THREE.TorusGeometry(2.85, 0.028, 8, 88), cyan);
  haloC.position.y = 3.3;
  haloC.rotation.set(0.52, 1.08, 0.18);
  core.add(haloC);

  const light = new THREE.PointLight(0x58dff0, 2.1, 27, 2);
  light.position.set(0, 4.2, 0);
  light.castShadow = false;
  core.add(light);

  const title = textSprite(THREE, "AI CORE", "CENTRAL COMMAND • 5 DIVISIONS", 0x69e1e9, 7.2);
  title.position.set(0, 5.55, 0);
  core.add(title);

  return { core, orb, wire, rings: [haloA, haloB, haloC], light };
}

function createReception(THREE, root) {
  const group = new THREE.Group();
  group.name = "campus-reception";
  group.position.set(0, 0, 15.5);
  root.add(group);
  const dark = material(THREE, 0x20394d, { metalness: 0.58, roughness: 0.32 });
  const top = material(THREE, 0xd6e5eb, { metalness: 0.26, roughness: 0.34 });
  const cyan = material(THREE, 0x4ecfe4, {
    emissive: 0x1686a4, emissiveIntensity: 0.6, metalness: 0.45
  });
  block(THREE, group, 5.4, 1.05, 1.2, 0, 0.55, 0, dark, true);
  block(THREE, group, 5.5, 0.14, 1.3, 0, 1.12, 0, top, true);
  block(THREE, group, 4.3, 0.055, 0.09, 0, 0.38, 0.66, cyan);
  block(THREE, group, 1.25, 0.78, 0.13, 0, 1.58, -0.34, dark);
  const display = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.68),
    new THREE.MeshBasicMaterial({ color: 0x6de5f3 }));
  display.position.set(0, 1.58, -0.265);
  group.add(display);
  const logo = textSprite(THREE, "RECEPTION", "WELCOME TO KANTOR AI", 0x65dce9, 5.5);
  logo.position.set(0, 2.45, -0.1);
  group.add(logo);
  const plantMat = material(THREE, 0x2f8b67, { roughness: 0.9 });
  [-3.4, 3.4].forEach(x => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.5, 12), dark);
    pot.position.set(x, 0.25, 0);
    group.add(pot);
    const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.58, 1), plantMat);
    leaves.position.set(x, 0.93, 0);
    leaves.scale.set(0.82, 1.1, 0.82);
    group.add(leaves);
  });
  return group;
}

export function enhancePremiumCampus({ THREE, scene, zones = [] }) {
  if (scene.userData.premiumCampusPhase13) return scene.userData.premiumCampusPhase13;
  const root = new THREE.Group();
  root.name = "premium-campus-phase-13";
  scene.add(root);

  // Move away from the dark checkerboard prototype look toward the bright,
  // polished campus floor and landscaped daytime setting in the approved mockup.
  scene.background = new THREE.Color(0xa8cde0);
  if (scene.fog) scene.fog.color.set(0xb8d6df);
  scene.traverse(object => {
    const p = object.geometry && object.geometry.parameters;
    if (!object.isMesh || !p) return;
    if (object.geometry.type === "PlaneGeometry" && p.width === 84 && p.height === 43) {
      object.material = material(THREE, 0xe7edf0, { roughness: 0.82, metalness: 0.025 });
      object.receiveShadow = true;
    }
    if (object.geometry.type === "BoxGeometry" && p.width === 420 && p.depth === 300) {
      object.material = material(THREE, 0x8fb98c, { roughness: 0.98, metalness: 0 });
      object.receiveShadow = false;
    }
  });

  const pods = (zones || []).map((zone, index) => createDepartmentPod(THREE, root, zone, index)).filter(Boolean);
  const command = createCentralCore(THREE, root);
  const reception = createReception(THREE, root);

  // Lightweight landscaped edge planters give the diorama a finished site boundary.
  const planter = material(THREE, 0x294858, { metalness: 0.5, roughness: 0.55 });
  const soil = material(THREE, 0x456a52, { roughness: 1 });
  const greens = [0x3b956b, 0x4d9f75, 0x67ae7e].map(c => material(THREE, c, { roughness: 0.92 }));
  const gardens = [];
  [[-44, 4], [44, 4], [-44, -20], [44, -20], [-12, 24], [12, 24]].forEach(([x, z], i) => {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.42, 2.0), planter);
    bed.position.set(x, -0.12, z);
    root.add(bed);
    const earth = new THREE.Mesh(new THREE.BoxGeometry(3.05, 0.06, 1.76), soil);
    earth.position.set(x, 0.12, z);
    root.add(earth);
    for (let j = 0; j < 3; j++) {
      const shrub = new THREE.Mesh(new THREE.IcosahedronGeometry(0.52, 1), greens[(i + j) % greens.length]);
      shrub.position.set(x - 0.85 + j * 0.85, 0.62, z);
      shrub.scale.set(1.15, 0.88, 1.0);
      root.add(shrub);
    }
    gardens.push(bed);
  });

  const data = {
    root, pods, command, reception, gardens,
    diagnostics() {
      return {
        departmentPodCount: pods.length,
        centralCoreReady: !!command.orb,
        receptionReady: !!reception,
        landscapedEdgeCount: gardens.length,
        theme: "premium-campus"
      };
    }
  };
  scene.userData.premiumCampusPhase13 = data;
  return data;
}

export function updatePremiumCampus(scene, dt) {
  const data = scene?.userData?.premiumCampusPhase13;
  if (!data) return;
  const step = Math.min(0.05, Math.max(0, dt || 0));
  const t = data.root.userData.elapsed = (data.root.userData.elapsed || 0) + step;
  const { command } = data;
  command.orb.rotation.y += step * 0.28;
  command.wire.rotation.y -= step * 0.16;
  command.wire.rotation.x += step * 0.08;
  command.rings[0].rotation.z += step * 0.34;
  command.rings[1].rotation.y += step * 0.22;
  command.rings[2].rotation.x -= step * 0.18;
  command.light.intensity = 1.9 + Math.sin(t * 1.4) * 0.22;
}
