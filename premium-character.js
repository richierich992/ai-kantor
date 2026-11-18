/* Premium Agent Characters — Phase 3
 * Adds role identity, a subtle status halo, and a secondary body-motion layer.
 * It decorates existing GLB avatars; it does not replace their geometry or paths.
 */
const ROLE_MARK = {
  1: "TRD", 2: "INV", 3: "DIV", 4: "FND",
  5: "BTC", 6: "CRP", 7: "GLD", 8: "LED",
  9: "VID", 10: "ART", 11: "DEV", 12: "SHOP",
  13: "TREND", 14: "CHEF", 15: "AI", 16: "BOT"
};

function roleBadgeTexture(THREE, id, accent) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const color = new THREE.Color(accent || "#63d9eb");
  const hex = "#" + color.getHexString();

  const gradient = ctx.createLinearGradient(0, 0, 256, 256);
  gradient.addColorStop(0, "#18364d");
  gradient.addColorStop(1, "#081827");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(12, 12, 232, 232, 48);
  ctx.fill();

  ctx.strokeStyle = hex;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.roundRect(17, 17, 222, 222, 42);
  ctx.stroke();

  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.roundRect(32, 32, 192, 20, 10);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#f4fbff";
  ctx.font = "900 66px Nunito, system-ui, sans-serif";
  ctx.fillText(ROLE_MARK[id] || "AI", 128, 139, 190);

  ctx.fillStyle = "#9ab7ca";
  ctx.font = "800 19px system-ui, sans-serif";
  ctx.fillText("GOSHEN AI", 128, 203);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function disposeObject(object) {
  if (!object) return;
  object.traverse?.(node => {
    if (node.geometry) node.geometry.dispose();
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach(material => {
      if (material?.map) material.map.dispose();
      material?.dispose?.();
    });
  });
}

export function decoratePremiumCharacter(character, THREE) {
  if (!character?.g) return;

  /* Remove previous decoration safely if the avatar model is swapped again. */
  if (character.premiumBadge?.parent) character.premiumBadge.parent.remove(character.premiumBadge);
  if (character.premiumRing?.parent) character.premiumRing.parent.remove(character.premiumRing);
  if (character.motion?.parent) character.motion.parent.remove(character.motion);
  disposeObject(character.premiumBadge);
  disposeObject(character.premiumRing);

  const model = character.g.children.find(child => child !== character.tag);
  if (!model) return;

  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);

  if (!Number.isFinite(size.y) || size.y < 0.2) {
    size.set(0.9, 1.8, 0.65);
    center.set(0, 0.9, 0);
    bounds.min.set(-0.45, 0, -0.32);
    bounds.max.set(0.45, 1.8, 0.32);
  }

  /* Body rig allows a gentle lean/breath without touching the route controller. */
  const motion = new THREE.Group();
  character.g.remove(model);
  motion.add(model);
  character.g.add(motion);
  character.motion = motion;

  const radius = Math.max(0.42, Math.max(size.x, size.z) * 0.34);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.022, 7, 40),
    new THREE.MeshBasicMaterial({
      color: 0x66e3c4,
      transparent: true,
      opacity: 0.62,
      depthWrite: false
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(center.x, Math.max(0.025, bounds.min.y + 0.035), center.z);
  ring.renderOrder = 3;
  character.g.add(ring);
  character.premiumRing = ring;

  const accent = character.r?.col || "#63d9eb";
  const map = roleBadgeTexture(THREE, character.r?.id, accent);
  const badge = new THREE.Sprite(new THREE.SpriteMaterial({
    map,
    transparent: true,
    depthTest: false,
    depthWrite: false
  }));
  badge.scale.set(0.38, 0.38, 1);
  badge.position.set(
    center.x + Math.max(0.3, size.x * 0.38),
    bounds.min.y + size.y * 0.72,
    bounds.max.z + 0.12
  );
  badge.renderOrder = 20;
  character.g.add(badge);
  character.premiumBadge = badge;
  character.premiumBadgeBaseY = badge.position.y;
}

export function animatePremiumCharacter(character, dt, THREE) {
  if (!character?.motion || !character.premiumRing) return;

  const t = Number(character.t) || 0;
  const moving = !!(character.path && character.path.length);
  const social = ["chat", "swing", "read", "type", "run", "lift", "shoot", "stretch"].includes(character.act);
  const working = !!character.busy || (character.work && character.loc === character.r);
  const blend = 1 - Math.exp(-Math.min(0.08, Math.max(0, dt)) * 7);

  let lean = 0;
  let sway = 0.012;
  let floatY = 0.008 * Math.sin(t * 1.35);

  if (moving) {
    lean = 0.015;
    sway = 0.008;
    floatY = 0;
  } else if (character.busy) {
    lean = 0.055 + Math.sin(t * 2.2) * 0.008;
    sway = 0.018;
    floatY = 0.012 * Math.sin(t * 2.4);
  } else if (social) {
    lean = character.act === "read" || character.act === "type" ? 0.035 : 0.012;
    sway = character.act === "chat" ? 0.032 : 0.015;
    floatY = 0.009 * Math.sin(t * 1.8);
  } else if (working) {
    lean = 0.018;
    sway = 0.012;
  }

  const motion = character.motion;
  motion.rotation.x += (lean - motion.rotation.x) * blend;
  motion.rotation.z += (Math.sin(t * (social ? 1.25 : 0.72)) * sway - motion.rotation.z) * blend;
  motion.position.y += (floatY - motion.position.y) * blend;

  const state = character.r?.st || "standby";
  const active = character.busy || state === "work" || social;
  const ringColor = active ? 0x63d9eb : state === "live" ? 0x66e3c4 : 0x7992a7;
  character.premiumRing.material.color.setHex(ringColor);
  character.premiumRing.material.opacity = active
    ? 0.58 + 0.18 * (0.5 + 0.5 * Math.sin(t * 2.8))
    : state === "live" ? 0.42 + 0.08 * (0.5 + 0.5 * Math.sin(t * 1.4)) : 0.28;
  const pulse = active ? 1 + 0.025 * Math.sin(t * 2.8) : 1 + 0.012 * Math.sin(t);
  character.premiumRing.scale.setScalar(pulse);

  if (character.premiumBadge) {
    const targetY = character.premiumBadgeBaseY + (character.busy ? 0.018 * Math.sin(t * 2.4) : 0);
    character.premiumBadge.position.y += (targetY - character.premiumBadge.position.y) * blend;
  }
}
