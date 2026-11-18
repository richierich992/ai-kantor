/* Isometric Office Interior — approved mockup rebuild
 * A cutaway, open-plan 3D office with glass team rooms, desk islands,
 * meeting room, reception and a dedicated Social Hub.
 *
 * This module owns presentation only. It reuses the existing logical room
 * objects, character groups, CanvasTexture room feeds and Social Hub stations.
 * No Firebase paths, Apps Script calls, agent IDs or routing contracts change.
 */

const DIVISION_STYLE = {
  finance: { color: 0x4b9a72, pale: 0xe7f1e9, label: "KEUANGAN & INVESTASI" },
  marketing_content: { color: 0xd66f91, pale: 0xf7e8ed, label: "MARKETING & KONTEN" },
  it_automation: { color: 0x4299b7, pale: 0xe7f1f6, label: "IT & OTOMASI" },
  research_intelligence: { color: 0x648ec1, pale: 0xe9eef7, label: "RISET & INTELIJEN" },
  hr_admin: { color: 0x9477b9, pale: 0xf0ebf5, label: "HR & ADMINISTRASI" }
};

function makeMaterial(THREE, color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.62,
    metalness: 0.12,
    ...options
  });
}

function addBox(THREE, parent, width, height, depth, x, y, z, material, shadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = !!shadow;
  mesh.receiveShadow = !!shadow;
  parent.add(mesh);
  return mesh;
}

function addCylinder(THREE, parent, radiusTop, radiusBottom, height, x, y, z, material) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 20),
    material
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeTileTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#dfe4e5";
  ctx.fillRect(0, 0, 512, 512);
  const tile = 64;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const tone = (row * 5 + col * 7) % 3;
      ctx.fillStyle = ["#e5e9e8", "#dce2e2", "#e1e6e5"][tone];
      ctx.fillRect(col * tile + 2, row * tile + 2, tile - 4, tile - 4);
      ctx.strokeStyle = "rgba(113,132,138,.22)";
      ctx.lineWidth = 2;
      ctx.strokeRect(col * tile + 1, row * tile + 1, tile - 2, tile - 2);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8.4, 4.3);
  texture.anisotropy = 4;
  return texture;
}

function makeNameTexture(THREE, title, subtitle, accent) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 180;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(17,32,45,.94)";
  ctx.beginPath();
  ctx.roundRect(5, 5, 758, 170, 22);
  ctx.fill();
  ctx.fillStyle = "#" + new THREE.Color(accent).getHexString();
  ctx.fillRect(5, 5, 11, 170);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#f4f8f9";
  ctx.font = "900 34px Nunito,system-ui,sans-serif";
  ctx.fillText(title, 42, 68, 690);
  ctx.fillStyle = "#aabac1";
  ctx.font = "700 20px system-ui,sans-serif";
  ctx.fillText(subtitle, 44, 121, 690);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function addWallSign(THREE, parent, title, subtitle, accent, x, y, z, width = 4.5) {
  const texture = makeNameTexture(THREE, title, subtitle, accent);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, width * 0.235),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false, side: THREE.DoubleSide })
  );
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function createGround(THREE, scene) {
  const slab = makeMaterial(THREE, 0x34434b, { roughness: 0.82, metalness: 0.16 });
  const floorMaterial = makeMaterial(THREE, 0xffffff, {
    map: makeTileTexture(THREE),
    roughness: 0.88,
    metalness: 0.025
  });
  addBox(THREE, scene, 88, 0.58, 47, 0, -0.34, -4.5, slab);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(84, 43), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.025, -4.5);
  floor.receiveShadow = true;
  scene.add(floor);

  const edge = makeMaterial(THREE, 0x53656c, { roughness: 0.5, metalness: 0.48 });
  addBox(THREE, scene, 88, 0.17, 0.26, 0, -0.04, -28.0, edge, false);
  addBox(THREE, scene, 88, 0.17, 0.26, 0, -0.04, 19.0, edge, false);
  addBox(THREE, scene, 0.26, 0.17, 47, -44.0, -0.04, -4.5, edge, false);
  addBox(THREE, scene, 0.26, 0.17, 47, 44.0, -0.04, -4.5, edge, false);

  // A subtle circulation strip connects the glass office wing to reception.
  const aisle = makeMaterial(THREE, 0xcbd4d4, { roughness: 0.84, metalness: 0.035 });
  addBox(THREE, scene, 5.3, 0.018, 42.2, 0, 0.006, -4.5, aisle, false);
  const aisleEdge = makeMaterial(THREE, 0x8ea3a7, { roughness: 0.75 });
  [-2.7, 2.7].forEach(x => addBox(THREE, scene, 0.035, 0.022, 42.0, x, 0.014, -4.5, aisleEdge, false));
  return { floor, slab };
}

function createPerimeter(THREE, scene) {
  const frame = makeMaterial(THREE, 0x40545e, { metalness: 0.62, roughness: 0.34 });
  const trim = makeMaterial(THREE, 0x78929d, { metalness: 0.54, roughness: 0.4 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xa9c8d5,
    metalness: 0.08,
    roughness: 0.18,
    transparent: true,
    opacity: 0.17,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  // The rear wall and long side windows frame the office without closing the cutaway view.
  addBox(THREE, scene, 84, 0.52, 0.22, 0, 0.28, -26.0, frame);
  addBox(THREE, scene, 84, 0.12, 0.18, 0, 3.8, -26.0, trim, false);
  const rearGlass = addBox(THREE, scene, 82.8, 2.9, 0.055, 0, 2.0, -25.87, glass, false);
  rearGlass.renderOrder = 2;
  for (let i = 0; i <= 14; i++) {
    const x = -41.2 + i * 5.885;
    addBox(THREE, scene, 0.085, 3.35, 0.13, x, 2.0, -25.82, frame, false);
  }

  [-42.0, 42.0].forEach(x => {
    addBox(THREE, scene, 0.22, 0.52, 43.0, x, 0.28, -4.5, frame);
    const sideGlass = addBox(THREE, scene, 0.055, 2.9, 41.8, x, 2.0, -4.5, glass, false);
    sideGlass.renderOrder = 2;
    addBox(THREE, scene, 0.16, 0.12, 43.0, x, 3.8, -4.5, trim, false);
    for (let i = 0; i <= 7; i++) {
      const z = -25.5 + i * 6.0;
      addBox(THREE, scene, 0.13, 3.25, 0.075, x, 2.0, z, frame, false);
    }
  });

  // Short glazing at the entrance leaves the central double-door fully open.
  [-7.2, 7.2].forEach(x => {
    const panel = addBox(THREE, scene, 0.06, 2.55, 7.6, x, 1.32, 15.15, glass, false);
    panel.renderOrder = 2;
    addBox(THREE, scene, 0.12, 2.65, 0.12, x, 1.35, 11.4, frame, false);
    addBox(THREE, scene, 0.12, 2.65, 0.12, x, 1.35, 18.9, frame, false);
  });
  addBox(THREE, scene, 14.7, 0.18, 0.18, 0, 2.75, 18.9, trim, false);

  // Exposed ceiling beams and warm rectangular light bars complete the open-ceiling cutaway.
  [-25.6, -15, -4.4, 6.2].forEach((z, i) => {
    addBox(THREE, scene, 84, 0.18, 0.18, 0, 4.18, z, frame, false);
    addBox(THREE, scene, 15.0, 0.075, 0.42, (i % 2 ? -16 : 16), 4.05, z + 1.2,
      makeMaterial(THREE, 0xf5f0de, { emissive: 0xd8c9a4, emissiveIntensity: 0.42 }), false);
  });
}

function createGlassDivisionPod(THREE, scene, zone) {
  const style = DIVISION_STYLE[zone.id] || DIVISION_STYLE.it_automation;
  const [x0, x1, z0, z1] = zone.box;
  const width = x1 - x0;
  const depth = z1 - z0;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const height = 3.35;
  const doorWidth = Math.min(width - 0.8, width < 10 ? 2.6 : 3.8);
  const segment = Math.max(0.35, (width - doorWidth) / 2);
  const frame = makeMaterial(THREE, 0x445861, { metalness: 0.62, roughness: 0.34 });
  const accent = makeMaterial(THREE, style.color, {
    emissive: style.color,
    emissiveIntensity: 0.12,
    metalness: 0.34,
    roughness: 0.42
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xa9cbd7,
    metalness: 0.08,
    roughness: 0.14,
    transparent: true,
    opacity: 0.13,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  // Pastel department rug zones make the open-plan desk clusters easy to read.
  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(width - 0.35, depth - 0.3),
    new THREE.MeshStandardMaterial({ color: style.pale, roughness: 0.94, metalness: 0.01 })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(cx, 0.012, cz);
  rug.receiveShadow = true;
  scene.add(rug);

  // Rear and side glazing.
  const rear = addBox(THREE, scene, width, height, 0.07, cx, height / 2, z0, glass, false);
  rear.renderOrder = 2;
  [x0, x1].forEach(x => {
    const panel = addBox(THREE, scene, 0.07, height, depth, x, height / 2, cz, glass, false);
    panel.renderOrder = 2;
  });

  // Front glazing is split around a clear double-door opening.
  const leftPanel = addBox(THREE, scene, segment, height, 0.07,
    x0 + segment / 2, height / 2, z1, glass, false);
  const rightPanel = addBox(THREE, scene, segment, height, 0.07,
    x1 - segment / 2, height / 2, z1, glass, false);
  leftPanel.renderOrder = 2;
  rightPanel.renderOrder = 2;

  // Dark mullions and a restrained department-colour kick strip.
  const postPoints = [
    [x0, z0], [x1, z0], [x0, z1], [x1, z1],
    [cx - doorWidth / 2, z1], [cx + doorWidth / 2, z1]
  ];
  postPoints.forEach(([x, z]) => addBox(THREE, scene, 0.13, height + 0.06, 0.14,
    x, height / 2, z, frame, false));
  addBox(THREE, scene, width, 0.12, 0.15, cx, height + 0.04, z0, frame, false);
  addBox(THREE, scene, width, 0.12, 0.15, cx, height + 0.04, z1, frame, false);
  const strip = addBox(THREE, scene, width - 0.25, 0.055, 0.1, cx, 0.13, z1 - 0.04, accent, false);

  const mullions = Math.max(1, Math.floor(depth / 5.2));
  for (let i = 1; i < mullions; i++) {
    const z = z0 + (depth / mullions) * i;
    addBox(THREE, scene, 0.075, height, 0.1, x0 + 0.04, height / 2, z, frame, false);
    addBox(THREE, scene, 0.075, height, 0.1, x1 - 0.04, height / 2, z, frame, false);
  }

  // Low-profile room plaque sits on the glass over the door, not as a floating billboard.
  const sign = addWallSign(THREE, scene, style.label, "TEAM WORKSPACE  •  GLASS PARTITION", style.color,
    cx, 3.0, z1 + 0.045, Math.min(6.5, Math.max(3.8, width * 0.32)));
  return { id: zone.id, rug, rear, leftPanel, rightPanel, sign, strip };
}

function createDeskChair(THREE, parent, materials, x, z, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  parent.add(group);
  addCylinder(THREE, group, 0.12, 0.16, 0.12, 0, 0.24, 0.12, materials.metal);
  addBox(THREE, group, 0.08, 0.43, 0.08, 0, 0.49, 0.12, materials.metal);
  addBox(THREE, group, 0.88, 0.14, 0.88, 0, 0.78, 0.12, materials.seat);
  addBox(THREE, group, 0.86, 0.95, 0.14, 0, 1.28, -0.32, materials.seat);
  [-0.34, 0.34].forEach(dx => addBox(THREE, group, 0.09, 0.38, 0.48, dx, 1.0, 0.1, materials.metal));
  return group;
}

function createWorkstation(THREE, room, materials) {
  const g = room.g;
  const style = DIVISION_STYLE[room.dept?.id] || DIVISION_STYLE.finance;
  const desk = new THREE.Group();
  desk.name = "isometric-agent-workstation-" + room.id;
  g.add(desk);

  // A warm timber top with slim graphite legs.
  addBox(THREE, desk, 3.25, 0.15, 1.5, 0, 0.88, -0.55, materials.wood);
  [-1.47, 1.47].forEach(x => {
    [-1.12, 0.02].forEach(z => addBox(THREE, desk, 0.105, 0.82, 0.105,
      x, 0.42, z, materials.metal));
  });
  addBox(THREE, desk, 0.11, 0.65, 1.05, -1.19, 0.46, -0.52, materials.drawer);
  addBox(THREE, desk, 0.11, 0.65, 1.05, 1.19, 0.46, -0.52, materials.drawer);
  addBox(THREE, desk, 0.055, 0.34, 0.04, -1.19, 0.48, 0.02, materials.metal, false);
  addBox(THREE, desk, 0.055, 0.34, 0.04, 1.19, 0.48, 0.02, materials.metal, false);

  // Main dynamic room display.
  addBox(THREE, desk, 1.58, 1.04, 0.115, -0.48, 1.58, -1.24, materials.frame);
  if (room.screenMesh) {
    room.screenMesh.visible = true;
    room.screenMesh.position.set(-0.48, 1.58, -1.17);
    room.screenMesh.rotation.set(0, 0, 0);
    room.screenMesh.scale.set(0.34, 0.34, 1);
    room.screenMesh.renderOrder = 5;
  } else {
    const display = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.82),
      new THREE.MeshBasicMaterial({ map: room.tx, toneMapped: false, side: THREE.DoubleSide }));
    display.position.set(-0.48, 1.58, -1.17);
    desk.add(display);
  }
  addBox(THREE, desk, 0.16, 0.3, 0.18, -0.48, 1.14, -1.24, materials.metal);

  // Secondary backend telemetry monitor, kept connected to the Phase 8 data renderer.
  const telemetry = g.children.find(child => child.userData?.phase8Monitor);
  if (telemetry) {
    telemetry.visible = true;
    telemetry.position.set(0.83, 1.46, -1.13);
    telemetry.rotation.set(0, 0, 0);
    telemetry.scale.set(1.05, 1.05, 1);
    telemetry.renderOrder = 5;
  } else {
    addBox(THREE, desk, 0.98, 0.68, 0.1, 0.82, 1.47, -1.22, materials.frame);
  }

  addBox(THREE, desk, 0.16, 0.28, 0.14, 0.83, 1.12, -1.2, materials.metal);
  addBox(THREE, desk, 0.88, 0.075, 0.3, -0.45, 0.995, -0.22, materials.keyboard);
  addBox(THREE, desk, 0.24, 0.07, 0.32, 0.55, 0.995, -0.22, materials.mouse);
  addBox(THREE, desk, 0.36, 0.34, 0.28, -1.2, 1.13, -0.36, materials.tower);
  addBox(THREE, desk, 0.08, 0.08, 0.08, -1.2, 1.13, -0.205, materials.accent);

  // Personal objects make desks feel occupied without cluttering the aisle.
  const cup = addCylinder(THREE, desk, 0.12, 0.14, 0.18, 1.22, 1.055, -0.24, materials.ceramic);
  cup.rotation.z = 0.03;
  addBox(THREE, desk, 0.46, 0.035, 0.29, 0.86, 0.99, 0.25, materials.paper, false);
  const plantPot = addCylinder(THREE, desk, 0.16, 0.19, 0.28, 1.3, 1.08, 0.44, materials.pot);
  const plant = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), materials.green);
  plant.position.set(1.3, 1.42, 0.44);
  plant.scale.set(0.9, 1.1, 0.9);
  desk.add(plant);
  void plantPot;

  createDeskChair(THREE, desk, materials, 0, 0.9, Math.PI);
  if (room.lamp) {
    room.lamp.visible = true;
    room.lamp.position.set(1.42, 1.36, -1.02);
    room.lamp.scale.setScalar(0.18);
  }

  // The character's standing/working point remains in front of its own desk.
  room.spot = g.localToWorld(new THREE.Vector3(0, 0, 1.58));
  room.inside = g.localToWorld(new THREE.Vector3(0, 0, 1.75));
  room.front = g.localToWorld(new THREE.Vector3(0, 0, 3.35));
  room.screenFocus = new THREE.Vector3(-0.48, 1.58, -1.17);
  room.row = g.position.z < -17 ? "A" : "B";
  room.furn = [];
  room.isometricOfficeReady = true;
  return desk;
}

function createMeetingRoom(THREE, room, materials) {
  if (!room?.g) return null;
  const group = room.g;
  const meetingPanel = group.children.find(child => child.userData?.phase8MeetingPanel);
  group.children.forEach(child => { child.visible = false; });
  if (meetingPanel) meetingPanel.visible = true;
  group.scale.setScalar(1.15);

  const floor = addBox(THREE, group, 7.5, 0.055, 6.8, 0, 0.035, 0, materials.meetingFloor, false);
  floor.receiveShadow = true;
  addBox(THREE, group, 6.0, 0.14, 2.25, 0, 0.82, -0.45, materials.wood);
  addBox(THREE, group, 0.18, 0.72, 0.18, -2.55, 0.38, -1.18, materials.metal);
  addBox(THREE, group, 0.18, 0.72, 0.18, 2.55, 0.38, -1.18, materials.metal);
  addBox(THREE, group, 0.18, 0.72, 0.18, -2.55, 0.38, 0.28, materials.metal);
  addBox(THREE, group, 0.18, 0.72, 0.18, 2.55, 0.38, 0.28, materials.metal);
  for (let i = 0; i < 3; i++) {
    const x = -1.95 + i * 1.95;
    createDeskChair(THREE, group, materials, x, -2.05, 0);
    createDeskChair(THREE, group, materials, x, 1.2, Math.PI);
  }
  [-1, 1].forEach(side => createDeskChair(THREE, group, materials, side * 3.25, -0.35,
    side > 0 ? -Math.PI / 2 : Math.PI / 2));
  if (meetingPanel) {
    meetingPanel.position.set(0, 3.0, -3.25);
    meetingPanel.rotation.set(0, 0, 0);
  } else {
    addWallSign(THREE, group, "MEETING ROOM", "CROSS-DIVISION BRIEFING", 0x4cabc0, 0, 3.0, -3.25, 5.5);
  }
  group.userData.isometricMeetingRoom = true;
  return group;
}

function createReception(THREE, scene, materials) {
  const group = new THREE.Group();
  group.name = "isometric-reception";
  group.position.set(0, 0, 14.6);
  scene.add(group);
  addBox(THREE, group, 5.5, 0.95, 1.45, 0, 0.55, 0, materials.drawer);
  addBox(THREE, group, 5.8, 0.15, 1.58, 0, 1.12, -0.03, materials.lightDesk);
  addBox(THREE, group, 4.8, 0.055, 0.095, 0, 0.5, 0.76, materials.accent);
  addBox(THREE, group, 1.25, 0.62, 0.06, 0, 1.54, -0.42, materials.frame);
  addWallSign(THREE, group, "RECEPTION", "WELCOME TO KANTOR AI", 0x65cbd1, 0, 2.45, -0.38, 5.6);

  [-3.65, 3.65].forEach(x => {
    addCylinder(THREE, group, 0.38, 0.43, 0.48, x, 0.24, 0.05, materials.pot);
    const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.58, 1), materials.green);
    leaves.position.set(x, 0.92, 0.05);
    leaves.scale.set(0.9, 1.25, 0.9);
    group.add(leaves);
  });
  return group;
}

function createPantry(THREE, scene, materials) {
  const group = new THREE.Group();
  group.name = "isometric-pantry";
  group.position.set(31.2, 0, 12.7);
  scene.add(group);
  addBox(THREE, group, 5.0, 0.95, 1.15, 0, 0.55, 0, materials.drawer);
  addBox(THREE, group, 5.25, 0.14, 1.28, 0, 1.08, 0, materials.lightDesk);
  addBox(THREE, group, 1.05, 0.8, 0.82, -1.55, 1.5, -0.1, materials.frame);
  addBox(THREE, group, 0.8, 0.55, 0.62, 1.1, 1.4, -0.1, materials.ceramic);
  addCylinder(THREE, group, 0.1, 0.1, 0.14, 1.1, 1.75, 0.05, materials.metal);
  [-1.45, 0, 1.45].forEach(x => {
    addCylinder(THREE, group, 0.22, 0.24, 0.85, x, 0.43, 1.0, materials.metal);
    addCylinder(THREE, group, 0.38, 0.38, 0.12, x, 0.85, 1.0, materials.seat);
  });
  addWallSign(THREE, group, "PANTRY", "COFFEE • BREAK • REFRESH", 0xd59f63, 0, 2.55, -0.68, 4.8);
  return group;
}

function createCollaborationTables(THREE, scene, materials) {
  const groups = [];
  const positions = [[-7.5, 2.0], [4.5, 2.0], [-7.5, 9.1], [4.5, 9.1]];
  positions.forEach(([x, z], index) => {
    const group = new THREE.Group();
    group.name = "isometric-collaboration-table-" + (index + 1);
    group.position.set(x, 0, z);
    scene.add(group);
    addBox(THREE, group, 3.9, 0.13, 1.8, 0, 0.88, 0, materials.wood);
    [-1.75, 1.75].forEach(dx => [-0.72, 0.72].forEach(dz =>
      addBox(THREE, group, 0.12, 0.82, 0.12, dx, 0.42, dz, materials.metal)));
    [-1, 1].forEach(side => {
      createDeskChair(THREE, group, materials, side * 2.45, 0, side > 0 ? -Math.PI / 2 : Math.PI / 2);
    });
    addBox(THREE, group, 0.95, 0.045, 0.48, 0, 0.99, -0.25, materials.paper, false);
    groups.push(group);
  });
  return groups;
}

function createOfficeLighting(THREE, scene, materials) {
  const fixtures = [];
  const lightPositions = [
    [-32, -16], [-19, -16], [-3, -16], [16, -16], [34, -21],
    [-32, -5], [-15, -5], [5, -5], [24, -5], [0, 9]
  ];
  lightPositions.forEach(([x, z], i) => {
    const group = new THREE.Group();
    group.name = "office-ceiling-light-" + i;
    group.position.set(x, 4.25, z);
    scene.add(group);
    addBox(THREE, group, 3.9, 0.10, 0.52, 0, 0, 0, materials.light, false);
    addBox(THREE, group, 3.25, 0.035, 0.14, 0, -0.075, 0, materials.lightGlow, false);
    const point = new THREE.PointLight(0xffedcf, 0.5, 13, 2);
    point.position.set(0, -0.22, 0);
    point.castShadow = false;
    group.add(point);
    fixtures.push({ group, point, phase: i * 0.55 });
  });
  return fixtures;
}

export function enhanceIsometricOffice({
  THREE, scene, rooms, characters, zones = [], zoneMeshes = [], groups = {}
}) {
  if (scene.userData.isometricOfficeRebuild) return scene.userData.isometricOfficeRebuild;
  const materials = {
    wood: makeMaterial(THREE, 0x9c754e, { roughness: 0.72 }),
    drawer: makeMaterial(THREE, 0x53636a, { roughness: 0.55, metalness: 0.25 }),
    metal: makeMaterial(THREE, 0x394b52, { roughness: 0.38, metalness: 0.68 }),
    frame: makeMaterial(THREE, 0x243942, { roughness: 0.35, metalness: 0.58 }),
    seat: makeMaterial(THREE, 0x415f72, { roughness: 0.65 }),
    accent: makeMaterial(THREE, 0x64c2c8, { emissive: 0x1e7479, emissiveIntensity: 0.14, metalness: 0.32 }),
    keyboard: makeMaterial(THREE, 0x26343a, { roughness: 0.5 }),
    mouse: makeMaterial(THREE, 0x303b40, { roughness: 0.38 }),
    tower: makeMaterial(THREE, 0x34444b, { roughness: 0.52, metalness: 0.32 }),
    ceramic: makeMaterial(THREE, 0xe5e7e3, { roughness: 0.28 }),
    paper: makeMaterial(THREE, 0xe8e6dc, { roughness: 0.92 }),
    pot: makeMaterial(THREE, 0x796b59, { roughness: 0.9 }),
    green: makeMaterial(THREE, 0x4b956a, { roughness: 0.92 }),
    lightDesk: makeMaterial(THREE, 0xdce5e3, { roughness: 0.34, metalness: 0.12 }),
    meetingFloor: makeMaterial(THREE, 0xe5e9e7, { roughness: 0.9 }),
    light: makeMaterial(THREE, 0x50636a, { roughness: 0.45, metalness: 0.56 }),
    lightGlow: new THREE.MeshBasicMaterial({ color: 0xffedcd })
  };

  const oldShell = scene.getObjectByName("legacy-department-shell");
  if (oldShell) oldShell.visible = false;
  const oldHr = scene.getObjectByName("legacy-hr-placeholder");
  if (oldHr) oldHr.visible = false;
  (zoneMeshes || []).forEach(mesh => { if (mesh) mesh.visible = false; });

  scene.background = new THREE.Color(0xb8c9ce);
  if (scene.fog) {
    scene.fog.color.set(0xc8d5d6);
    scene.fog.near = 170;
    scene.fog.far = 330;
  }

  const ground = createGround(THREE, scene);
  createPerimeter(THREE, scene);
  const glassPods = (zones || []).map(zone => createGlassDivisionPod(THREE, scene, zone));

  let workstationCount = 0;
  Object.values(rooms || {}).forEach(room => {
    if (!room || room.meet || typeof room.id !== "number") return;
    const telemetry = room.g.children.find(child => child.userData?.phase8Monitor);
    room.g.children.forEach(child => {
      child.visible = child === room.screenMesh || child === room.lamp || child === telemetry;
    });
    if (room.screenMesh) {
      room.screenMesh.visible = false;
    }
    if (telemetry) telemetry.visible = false;
    if (room.lamp) room.lamp.visible = false;

    createWorkstation(THREE, room, materials);
    const character = characters?.[room.id];
    if (character?.g && room.spot) {
      character.g.position.copy(room.spot);
      character.g.rotation.y = room.yaw + Math.PI;
      character.loc = room;
      character.path = [];
      character.done = null;
      character.face = room.yaw + Math.PI;
      character.busy = false;
    }
    workstationCount++;
  });

  const meetingRoom = createMeetingRoom(THREE, rooms?.[0], materials);
  const reception = createReception(THREE, scene, materials);
  const pantry = createPantry(THREE, scene, materials);
  const collaboration = createCollaborationTables(THREE, scene, materials);
  const fixtures = createOfficeLighting(THREE, scene, materials);

  // Built-in signs, planter dividers and low storage provide office-scale depth cues.
  const planter = makeMaterial(THREE, 0x536c60, { roughness: 0.92 });
  const soil = makeMaterial(THREE, 0x3d7552, { roughness: 1 });
  [[-9, -24], [12, -24], [-10, -8], [13, -8], [7, 12], [-10, 12]].forEach(([x, z]) => {
    addBox(THREE, scene, 2.2, 0.48, 1.1, x, 0.24, z, planter);
    addBox(THREE, scene, 2.0, 0.09, 0.92, x, 0.50, z, soil, false);
    const shrub = new THREE.Mesh(new THREE.IcosahedronGeometry(0.52, 1), materials.green);
    shrub.position.set(x, 0.95, z);
    shrub.scale.set(1.2, 0.95, 0.95);
    scene.add(shrub);
  });

  scene.updateMatrixWorld(true);
  const aspect = typeof window !== "undefined" ? window.innerWidth / Math.max(1, window.innerHeight) : 1.6;
  const portrait = aspect < 0.85;
  const target = new THREE.Vector3(0, 1.0, -4.7);
  const camera = portrait ? new THREE.Vector3(23, 86, 116) : new THREE.Vector3(49, 61, 59);
  if (groups.camera) {
    groups.camera.fov = portrait ? 55 : 43;
    groups.camera.updateProjectionMatrix();
    groups.camera.position.copy(camera);
  }
  if (groups.controls) {
    groups.controls.target.copy(target);
    groups.controls.update();
  }
  if (typeof groups.setTarget === "function") {
    groups.setTarget({ t: target.clone(), c: camera.clone() });
  }

  const result = {
    ground,
    glassPods,
    meetingRoom,
    reception,
    pantry,
    collaboration,
    fixtures,
    workstationCount,
    diagnostics() {
      return {
        theme: "isometric-open-office",
        workstationCount,
        glassDivisionCount: glassPods.length,
        meetingRoomReady: !!meetingRoom,
        receptionReady: !!reception,
        pantryReady: !!pantry,
        collaborationDeskCount: collaboration.length
      };
    }
  };
  scene.userData.isometricOfficeRebuild = result;
  return result;
}

export function updateIsometricOffice(scene, dt) {
  const office = scene?.userData?.isometricOfficeRebuild;
  if (!office) return;
  const step = Math.min(0.05, Math.max(0, dt || 0));
  office.fixtures.forEach(item => {
    item.point.intensity = 0.48 + Math.sin((office.elapsed || 0) * 0.7 + item.phase) * 0.035;
  });
  office.elapsed = (office.elapsed || 0) + step;
}
