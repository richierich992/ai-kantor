/* Character Social Life — Phase 9
 * Lightweight social cues and non-blocking greetings for existing GLB agents.
 * Does not alter navigation, task state, or backend data.
 */
const ACTIVITY_ICONS = {
  chat: "💬", swing: "🏓", type: "⌨️", read: "📖", run: "🏃",
  lift: "💪", shoot: "🏀", stretch: "🧘"
};

function roundedCard(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
}

function createBubble(THREE, character) {
  if (character.lifeBubble?.parent) character.lifeBubble.parent.remove(character.lifeBubble);
  character.lifeBubble?.material?.map?.dispose?.();
  character.lifeBubble?.material?.dispose?.();

  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 160;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = new THREE.SpriteMaterial({
    map: texture, transparent: true, depthTest: true, depthWrite: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.72, 0.45, 1);
  const badgeY = character.premiumBadge?.position?.y || character.tag?.position?.y || 2.6;
  sprite.position.set(0.42, badgeY + 0.62, 0.04);
  sprite.renderOrder = 30;
  sprite.visible = false;
  sprite.userData.canvas = canvas;
  sprite.userData.ctx = ctx;
  sprite.userData.texture = texture;
  sprite.userData.currentIcon = "";
  character.g.add(sprite);
  character.lifeBubble = sprite;
  return sprite;
}

function paintBubble(sprite, icon) {
  if (!sprite || sprite.userData.currentIcon === icon) return;
  const ctx = sprite.userData.ctx;
  const canvas = sprite.userData.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (icon) {
    ctx.shadowColor = "rgba(0,0,0,.26)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "rgba(8,24,40,.94)";
    roundedCard(ctx, 12, 10, 232, 140, 52);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(115,219,232,.78)";
    ctx.lineWidth = 5;
    roundedCard(ctx, 14, 12, 228, 136, 48);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '76px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
    ctx.fillStyle = "#ffffff";
    ctx.fillText(icon, 128, 79);
  }
  sprite.userData.currentIcon = icon;
  sprite.userData.texture.needsUpdate = true;
  sprite.visible = !!icon;
}

function activityIcon(character, now) {
  if (character.greetingUntil > now) return "👋";
  if (character.meeting) return "🗣️";
  if (character.busy) return "⚙️";
  if (character.act && ACTIVITY_ICONS[character.act]) return ACTIVITY_ICONS[character.act];
  if (character.work && character.loc === character.r) return "🧠";
  return "";
}

function moving(character) {
  return !!(character.path && character.path.length);
}

export function createCharacterSocialLife({ THREE, characters = {} }) {
  if (!THREE) return null;
  const cooldowns = new Map();
  const previousDistances = new Map();
  const entries = Object.values(characters);
  entries.forEach(character => createBubble(THREE, character));

  function attach(character) {
    if (!character?.g) return;
    createBubble(THREE, character);
  }

  function triggerGreeting(a, b, now) {
    const ids = [Number(a.r?.id), Number(b.r?.id)].sort((x, y) => x - y);
    const key = ids.join(":");
    const last = cooldowns.get(key) || 0;
    if (now - last < 42000) return;
    if (a.busy || b.busy || a.meeting || b.meeting || a.r?.lock || b.r?.lock) return;
    if (a.slot && b.slot && a.slot === b.slot) return;
    if (moving(a) === moving(b)) return;

    cooldowns.set(key, now);
    a.greetingUntil = now + 1750;
    b.greetingUntil = now + 1750;
    a.greetingPeer = b.r?.id;
    b.greetingPeer = a.r?.id;
  }

  function detectPassing(now) {
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i], b = entries[j];
        if (!a?.g || !b?.g || a.busy || b.busy || a.meeting || b.meeting) continue;
        const distance = a.g.position.distanceTo(b.g.position);
        const ids = [Number(a.r?.id), Number(b.r?.id)].sort((x, y) => x - y);
        const key = ids.join(":");
        const before = previousDistances.get(key);
        previousDistances.set(key, distance);
        if (before != null && before > 3.05 && distance <= 2.65 &&
            (moving(a) !== moving(b))) triggerGreeting(a, b, now);
      }
    }
  }

  function update(dt, elapsedSeconds) {
    const now = performance.now();
    detectPassing(now);
    entries.forEach(character => {
      if (!character?.g) return;
      if (!character.lifeBubble?.parent) attach(character);
      const icon = activityIcon(character, now);
      const bubble = character.lifeBubble;
      paintBubble(bubble, icon);
      if (bubble?.visible) {
        const pulse = 1 + 0.045 * Math.sin((elapsedSeconds || 0) * 5 + Number(character.r?.id || 0));
        bubble.scale.set(0.72 * pulse, 0.45 * pulse, 1);
        bubble.position.y = (character.premiumBadge?.position?.y || character.tag?.position?.y || 2.6) + 0.62 +
          0.04 * Math.sin((elapsedSeconds || 0) * 2.4 + Number(character.r?.id || 0));
      }

      if (character.greetingUntil > now && character.armR) {
        const phase = (now - (character.greetingUntil - 1750)) / 1750;
        const wave = Math.sin(phase * Math.PI * 5) * 0.16;
        character.armR.rotation.z += (0.48 + wave - character.armR.rotation.z) * Math.min(1, dt * 12);
        character.armR.rotation.y += (0.18 - character.armR.rotation.y) * Math.min(1, dt * 8);
      }
    });
  }

  function diagnostics() {
    return {
      characterCount: entries.length,
      bubbleCount: entries.filter(character => !!character.lifeBubble).length,
      greetingEnabled: true,
      activityCueCount: entries.filter(character => !!character.act || character.busy || character.meeting).length
    };
  }

  return { attach, update, diagnostics };
}
