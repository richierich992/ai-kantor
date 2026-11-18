/* Premium Game Experience — Phase 7
 * Environment material, divisional detailing and lightweight camera presets.
 * All objects are decorative: no original raycast targets or app data are replaced.
 */

const DEPARTMENT_COLORS = {
  finance: 0x58d68d,
  marketing_content: 0xee789e,
  it_automation: 0x5ebfe5,
  research_intelligence: 0x91a7ff,
  hr_admin: 0xc39be8
};

function makeGrassTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, "#526e60");
  gradient.addColorStop(0.5, "#607965");
  gradient.addColorStop(1, "#435e56");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 620; i++) {
    const x = (i * 137.5) % 512;
    const y = (i * 83.7 + (i % 11) * 19) % 512;
    const radius = 1 + (i % 4) * 0.55;
    ctx.fillStyle = i % 3 === 0 ? "rgba(177,199,155,.10)" : "rgba(22,47,39,.09)";
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(34, 25); texture.anisotropy = 4;
  return texture;
}

function makeFloorTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const tile = 64;
  for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
    const shade = 92 + ((row * 7 + col * 11) % 17);
    ctx.fillStyle = `rgb(${shade - 8},${shade + 7},${shade + 12})`;
    ctx.fillRect(col * tile, row * tile, tile, tile);
    ctx.strokeStyle = "rgba(218,239,242,.15)"; ctx.lineWidth = 2;
    ctx.strokeRect(col * tile + 1, row * tile + 1, tile - 2, tile - 2);
    ctx.strokeStyle = "rgba(12,28,39,.14)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(col * tile + 4, row * tile + tile - 4);
    ctx.lineTo(col * tile + tile - 4, row * tile + tile - 4); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(14, 8); texture.anisotropy = 4;
  return texture;
}

function findMesh(scene, predicate) {
  let found = null;
  scene.traverse(object => { if (!found && object.isMesh && predicate(object)) found = object; });
  return found;
}

function addBar(THREE, scene, width, height, depth, x, y, z, color, intensity = 0.55) {
  const material = new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: intensity, roughness: 0.38, metalness: 0.36
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z); mesh.castShadow = false; mesh.receiveShadow = false;
  scene.add(mesh); return mesh;
}

function addBollard(THREE, scene, x, z, color) {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.23, 0.18, 12),
    new THREE.MeshStandardMaterial({ color: 0x1a3040, metalness: 0.7, roughness: 0.32 }));
  base.position.set(x, -0.32, z); base.castShadow = false; scene.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.12, 0.8, 10),
    new THREE.MeshStandardMaterial({ color: 0x29485a, metalness: 0.58, roughness: 0.35 }));
  post.position.set(x, 0.16, z); post.castShadow = false; scene.add(post);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 10),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2, roughness: 0.28, metalness: 0.1 }));
  cap.position.set(x, 0.62, z); cap.castShadow = false; scene.add(cap);
}

function refineEnvironment(THREE, scene) {
  const grass = findMesh(scene, object => {
    const p = object.geometry?.parameters;
    return object.geometry?.type === "BoxGeometry" && p?.width === 420 && p?.depth === 300;
  });
  if (grass) {
    const oldMaterial = grass.material;
    grass.material = new THREE.MeshStandardMaterial({
      map: makeGrassTexture(THREE), color: 0xffffff, roughness: 0.96, metalness: 0
    });
    if (oldMaterial && !Array.isArray(oldMaterial)) oldMaterial.dispose();
    grass.receiveShadow = false; grass.castShadow = false;
  }

  const floor = findMesh(scene, object => {
    const p = object.geometry?.parameters;
    return object.geometry?.type === "PlaneGeometry" && p?.width === 84 && p?.height === 43;
  });
  if (floor) {
    const oldMaterial = floor.material;
    floor.material = new THREE.MeshStandardMaterial({
      map: makeFloorTexture(THREE), color: 0xffffff, roughness: 0.76, metalness: 0.08
    });
    if (oldMaterial && !Array.isArray(oldMaterial)) oldMaterial.dispose();
    floor.receiveShadow = false; floor.castShadow = false;
  }

  const trim = new THREE.MeshStandardMaterial({
    color: 0x294c60, metalness: 0.72, roughness: 0.28,
    emissive: 0x123747, emissiveIntensity: 0.3
  });
  const edgeSpecs = [
    [88.4, 0.11, 0.13, 0, -0.64, -28.38],
    [88.4, 0.11, 0.13, 0, -0.64, 19.38],
    [0.13, 0.11, 47.5, -44.32, -0.64, -4.5],
    [0.13, 0.11, 47.5, 44.32, -0.64, -4.5]
  ];
  edgeSpecs.forEach(([w, h, d, x, y, z]) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), trim);
    mesh.position.set(x, y, z); mesh.castShadow = false; mesh.receiveShadow = false; scene.add(mesh);
  });

  for (let i = 0; i < 5; i++) {
    const z = 22.6 + i * 1.25;
    addBar(THREE, scene, 0.08, 0.025, 0.72, -3.85, -0.315, z, 0x6bdde8, 0.32);
    addBar(THREE, scene, 0.08, 0.025, 0.72, 3.85, -0.315, z, 0x6bdde8, 0.32);
  }
  [-7.2, 7.2].forEach(x => {
    addBollard(THREE, scene, x, 22.7, 0x70e4e7);
    addBollard(THREE, scene, x, 26.0, 0x8be6ce);
  });
}

function addDepartmentDetails(THREE, scene, zones) {
  (zones || []).forEach(zone => {
    const bounds = zone.box;
    if (!Array.isArray(bounds) || bounds.length !== 4) return;
    const [x0, x1, z0, z1] = bounds;
    const width = x1 - x0, depth = z1 - z0;
    if (width < 4 || depth < 4) return;
    const color = DEPARTMENT_COLORS[zone.id] || 0x63d9eb;
    const center = (x0 + x1) / 2, front = z1 - 0.28;
    const doorWidth = Math.min(3.8, width * 0.34);
    const segmentWidth = Math.max(0.5, (width - doorWidth - 0.9) / 2);
    addBar(THREE, scene, segmentWidth, 0.035, 0.09,
      x0 + segmentWidth / 2 + 0.2, 0.105, front, color, 0.5);
    addBar(THREE, scene, segmentWidth, 0.035, 0.09,
      x1 - segmentWidth / 2 - 0.2, 0.105, front, color, 0.5);
    addBar(THREE, scene, width - 0.5, 0.045, 0.12,
      center, 3.27, z0 + 0.13, color, 0.36);
    addBar(THREE, scene, 0.09, 1.7, Math.max(1.2, depth - 3),
      x0 + 0.16, 1.55, (z0 + z1) / 2, color, 0.22);
  });
}

function createCameraDock(onPreset) {
  const old = document.getElementById("camera-dock");
  if (old) old.remove();
  const dock = document.createElement("aside");
  dock.id = "camera-dock";
  dock.setAttribute("aria-label", "Preset kamera kantor");
  dock.innerHTML = `
    <div class="camera-dock-title">CAMERA VIEW</div>
    <div class="camera-dock-actions">
      <button type="button" data-preset="overview" aria-pressed="true">Overview</button>
      <button type="button" data-preset="cinematic" aria-pressed="false">Cinematic</button>
      <button type="button" data-preset="social" aria-pressed="false">Social Hub</button>
    </div>`;
  document.body.appendChild(dock);
  const buttons = [...dock.querySelectorAll("[data-preset]")];
  buttons.forEach(button => button.addEventListener("click", () => {
    const preset = button.dataset.preset;
    if (typeof onPreset === "function") onPreset(preset);
    buttons.forEach(item => item.setAttribute("aria-pressed", item === button ? "true" : "false"));
  }));

  const syncVisibility = () => {
    const chatOpen = document.getElementById("chat")?.classList.contains("open");
    const modalOpen = ["dash", "cfgm", "cmdm"].some(id => {
      const element = document.getElementById(id);
      return element && !element.classList.contains("hidden");
    });
    dock.hidden = !!(chatOpen || modalOpen);
  };
  ["chat", "dash", "cfgm", "cmdm"].forEach(id => {
    const element = document.getElementById(id);
    if (element) new MutationObserver(syncVisibility).observe(element, {
      attributes: true, attributeFilter: ["class"]
    });
  });
  syncVisibility();
  return {
    setActive(preset) {
      buttons.forEach(button => button.setAttribute("aria-pressed",
        button.dataset.preset === preset ? "true" : "false"));
    }
  };
}

export function enhancePremiumExperience({ THREE, scene, zones = [], onPreset }) {
  if (scene.userData.premiumExperiencePhase7) return scene.userData.premiumExperiencePhase7;
  refineEnvironment(THREE, scene);
  addDepartmentDetails(THREE, scene, zones);
  const cameraDock = createCameraDock(onPreset);
  const result = { cameraDock, environmentEnhanced: true, decoratedDepartments: zones.length };
  scene.userData.premiumExperiencePhase7 = result;
  return result;
}
