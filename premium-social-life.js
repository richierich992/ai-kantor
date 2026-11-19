/* Character Social Life — Phase 10
 * Ambient greetings plus face-to-face conversations in Social Hub seating.
 * Conversations use local dialogue only; navigation, tasks and backend data stay untouched.
 */
const ACTIVITY_ICONS = {
  chat: "💬", swing: "🏓", type: "⌨️", read: "📖", run: "🏃",
  lift: "💪", shoot: "🏀", stretch: "🧘"
};

const CONVERSATION_SCRIPTS = [
  [
    { speaker: 0, text: "Lagi padat tugas hari ini?" },
    { speaker: 1, text: "Lumayan, tapi sudah mulai rapi." },
    { speaker: 0, text: "Nanti istirahat bareng, yuk." },
    { speaker: 1, text: "Boleh. Sekalian ngopi." },
    { speaker: 0, text: "Setelah ini aku ke kafe." },
    { speaker: 1, text: "Oke, kita jalan bareng." }
  ],
  [
    { speaker: 0, text: "Sudah lihat update terbaru?" },
    { speaker: 1, text: "Sudah. Idenya menarik." },
    { speaker: 0, text: "Ada hal yang perlu kita bahas." },
    { speaker: 1, text: "Siap, nanti kita diskusikan." },
    { speaker: 0, text: "Aku catat dulu poinnya." },
    { speaker: 1, text: "Mantap, biar tidak lupa." }
  ],
  [
    { speaker: 0, text: "Bagaimana suasana kerja hari ini?" },
    { speaker: 1, text: "Seru, banyak hal baru." },
    { speaker: 0, text: "Tim sedang cukup kompak." },
    { speaker: 1, text: "Iya, koordinasinya makin enak." },
    { speaker: 0, text: "Semoga target kita tercapai." },
    { speaker: 1, text: "Amin. Tetap semangat!" }
  ],
  [
    { speaker: 0, text: "Kopi di sini cocok, ya." },
    { speaker: 1, text: "Iya, pas buat recharge." },
    { speaker: 0, text: "Sebentar lagi lanjut kerja?" },
    { speaker: 1, text: "Iya, habis ngobrol sebentar." },
    { speaker: 0, text: "Asyik juga istirahat begini." },
    { speaker: 1, text: "Setuju. Bikin fresh lagi." }
  ]
];

function roundedCard(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
}

/* Two chat seats must belong to the same station and face one another. */
export function areConversationSlotsCompatible(a, b) {
  if (!a || !b || a === b || !a.st || a.st !== b.st) return false;
  if (a.act !== "chat" || b.act !== "chat") return false;
  const dx = Number(b.x) - Number(a.x);
  const dz = Number(b.z) - Number(a.z);
  const distance = Math.hypot(dx, dz);
  if (!Number.isFinite(distance) || distance < 1.25 || distance > 6.5) return false;
  const faceA = Number(a.face) || 0;
  const faceB = Number(b.face) || 0;
  const towardB = (dx / distance) * Math.sin(faceA) + (dz / distance) * Math.cos(faceA);
  const towardA = (-dx / distance) * Math.sin(faceB) + (-dz / distance) * Math.cos(faceB);
  return towardB >= 0.62 && towardA >= 0.62;
}

function createBubble(THREE, character) {
  if (character.lifeBubble?.parent) character.lifeBubble.parent.remove(character.lifeBubble);
  character.lifeBubble?.material?.map?.dispose?.();
  character.lifeBubble?.material?.dispose?.();

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 192;
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
  sprite.position.set(0.34, badgeY + 0.62, 0.04);
  sprite.renderOrder = 30;
  sprite.visible = false;
  sprite.userData.canvas = canvas;
  sprite.userData.ctx = ctx;
  sprite.userData.texture = texture;
  sprite.userData.currentContent = "";
  sprite.userData.currentKind = "";
  character.g.add(sprite);
  character.lifeBubble = sprite;
  return sprite;
}

function paintBubble(sprite, content, kind = "icon") {
  if (!sprite) return;
  const value = String(content || "");
  const key = kind + ":" + value;
  if (sprite.userData.currentContent === value && sprite.userData.currentKind === kind) return;
  const ctx = sprite.userData.ctx;
  const canvas = sprite.userData.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (value) {
    ctx.shadowColor = "rgba(0,0,0,.26)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "rgba(8,24,40,.96)";
    roundedCard(ctx, 10, 10, 492, 172, 42);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(115,219,232,.82)";
    ctx.lineWidth = 5;
    roundedCard(ctx, 12, 12, 488, 168, 40);
    ctx.stroke();

    if (kind === "text") {
      ctx.fillStyle = "#f1f8ff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let fontSize = 34;
      ctx.font = '700 ' + fontSize + 'px "Nunito",system-ui,sans-serif';
      const words = value.split(/\s+/);
      let lines = [], line = "";
      words.forEach(word => {
        const next = line ? line + " " + word : word;
        if (ctx.measureText(next).width > 444 && line) {
          lines.push(line);
          line = word;
        } else line = next;
      });
      if (line) lines.push(line);
      if (lines.length > 2) {
        fontSize = 29;
        ctx.font = '700 ' + fontSize + 'px "Nunito",system-ui,sans-serif';
        lines = [lines.slice(0, -1).join(" "), lines[lines.length - 1]];
      }
      const visible = lines.slice(0, 2);
      const firstY = visible.length === 1 ? 96 : 72;
      visible.forEach((text, index) => ctx.fillText(text, 256, firstY + index * 46, 444));
    } else {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = '92px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
      ctx.fillStyle = "#ffffff";
      ctx.fillText(value, 256, 98);
    }
  }

  sprite.userData.currentContent = value;
  sprite.userData.currentKind = kind;
  sprite.userData.texture.needsUpdate = true;
  sprite.scale.set(kind === "text" ? 1.62 : 0.72, kind === "text" ? 0.62 : 0.45, 1);
  sprite.visible = !!value;
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

function readyForConversation(a, b) {
  if (!a || !b || a === b) return false;
  if (a.busy || b.busy || a.meeting || b.meeting || a.r?.lock || b.r?.lock) return false;
  if (a.act !== "chat" || b.act !== "chat") return false;
  if (moving(a) || moving(b)) return false;
  const slotA = a.slot, slotB = b.slot;
  if (!slotA || !slotB || slotA.occ !== a || slotB.occ !== b) return false;
  if (a.loc !== slotA || b.loc !== slotB) return false;
  return areConversationSlotsCompatible(slotA, slotB);
}

function pairKey(a, b) {
  const ids = [Number(a.r?.id), Number(b.r?.id)].sort((x, y) => x - y);
  return ids.join(":");
}

export function createCharacterSocialLife({ THREE, characters = {} }) {
  if (!THREE) return null;
  const cooldowns = new Map();
  const previousDistances = new Map();
  const conversations = new Map();
  const entries = Object.values(characters);
  entries.forEach(character => createBubble(THREE, character));

  function attach(character) {
    if (!character?.g) return;
    createBubble(THREE, character);
  }

  function triggerGreeting(a, b, now) {
    const key = pairKey(a, b);
    const last = cooldowns.get("g:" + key);
    if (last != null && now - last < 42000) return;
    if (a.busy || b.busy || a.meeting || b.meeting || a.r?.lock || b.r?.lock) return;
    if (a.slot && b.slot && a.slot === b.slot) return;
    if (moving(a) === moving(b)) return;

    cooldowns.set("g:" + key, now);
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
        const key = pairKey(a, b);
        const before = previousDistances.get(key);
        previousDistances.set(key, distance);
        if (before != null && before > 3.05 && distance <= 2.65 &&
            (moving(a) !== moving(b))) triggerGreeting(a, b, now);
      }
    }
  }

  function updateConversations(now) {
    const cues = new Map();
    const eligiblePairs = new Set();
    const claimed = new Set();

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i], b = entries[j];
        if (claimed.has(a) || claimed.has(b) || !readyForConversation(a, b)) continue;
        const key = pairKey(a, b);
        eligiblePairs.add(key);
        claimed.add(a);
        claimed.add(b);

        let conversation = conversations.get(key);
        if (!conversation) {
          const last = cooldowns.get("c:" + key);
          if (last != null && now - last < 60000) continue;
          const scriptIndex = Math.abs(Number(a.r?.id || 0) * 7 + Number(b.r?.id || 0) * 11) % CONVERSATION_SCRIPTS.length;
          conversation = {
            a, b, startedAt: now,
            script: CONVERSATION_SCRIPTS[scriptIndex]
          };
          /* Keep both guests seated until every dialogue turn has finished.
             roam() uses character.wait as the Social Hub dwell timer. */
          const conversationHold = conversation.script.length * 2.7 + 3;
          [a, b].forEach(character => {
            character.wait = Math.max(Number(character.wait) || 0, conversationHold);
          });
          conversations.set(key, conversation);
        }

        const turnIndex = Math.floor((now - conversation.startedAt) / 2700);
        if (turnIndex >= conversation.script.length) {
          conversations.delete(key);
          cooldowns.set("c:" + key, now);
          continue;
        }

        const turn = conversation.script[turnIndex];
        const speaker = turn.speaker === 0 ? conversation.a : conversation.b;
        const listener = turn.speaker === 0 ? conversation.b : conversation.a;
        cues.set(speaker, { kind: "text", content: turn.text });
        cues.set(listener, { kind: "listen", content: "👂" });
      }
    }

    for (const [key] of conversations) {
      if (!eligiblePairs.has(key)) {
        conversations.delete(key);
        cooldowns.set("c:" + key, now);
      }
    }
    return cues;
  }

  function update(dt, elapsedSeconds) {
    const now = performance.now();
    detectPassing(now);
    const cues = updateConversations(now);

    entries.forEach(character => {
      if (!character?.g) return;
      if (!character.lifeBubble?.parent) attach(character);
      const bubble = character.lifeBubble;
      const cue = cues.get(character);
      if (cue) paintBubble(bubble, cue.content, cue.kind === "text" ? "text" : "icon");
      else paintBubble(bubble, activityIcon(character, now), "icon");

      if (bubble?.visible) {
        const pulse = 1 + 0.035 * Math.sin((elapsedSeconds || 0) * 5 + Number(character.r?.id || 0));
        const textBubble = bubble.userData.currentKind === "text";
        bubble.scale.set((textBubble ? 1.62 : 0.72) * pulse,
          (textBubble ? 0.62 : 0.45) * pulse, 1);
        bubble.position.y = (character.premiumBadge?.position?.y || character.tag?.position?.y || 2.6) + 0.62 +
          0.04 * Math.sin((elapsedSeconds || 0) * 2.4 + Number(character.r?.id || 0));
      }

      if (character.armR) {
        const waving = character.greetingUntil > now;
        const speaking = cue?.kind === "text";
        const listening = cue?.kind === "listen";
        const phase = waving ? (now - (character.greetingUntil - 1750)) / 1750 : 0;
        const wave = waving ? Math.sin(phase * Math.PI * 5) * 0.16 : 0;
        const gesture = speaking ? Math.sin(now / 310 + Number(character.r?.id || 0)) * 0.13 : 0;
        const targetZ = waving ? 0.48 + wave : speaking ? 0.32 + gesture : listening ? 0.08 : (character.meeting ? 0.16 : 0);
        const targetY = waving || speaking ? 0.18 : (character.meeting ? 0.12 : 0);
        character.armR.rotation.z += (targetZ - character.armR.rotation.z) * Math.min(1, dt * 12);
        character.armR.rotation.y += (targetY - character.armR.rotation.y) * Math.min(1, dt * 8);
      }
      if (character.armL && cue) {
        const target = cue.kind === "text" ? -0.12 : -0.02;
        character.armL.rotation.z += (target - character.armL.rotation.z) * Math.min(1, dt * 9);
      }
    });
  }

  function diagnostics() {
    return {
      characterCount: entries.length,
      bubbleCount: entries.filter(character => !!character.lifeBubble).length,
      greetingEnabled: true,
      conversationEnabled: true,
      conversationStationKinds: ["lounge", "chess"],
      conversationLineCount: CONVERSATION_SCRIPTS.reduce((sum, script) => sum + script.length, 0),
      activityCueCount: entries.filter(character => !!character.act || character.busy || character.meeting).length
    };
  }

  return {
    attach,
    update,
    diagnostics,
    canPairSlots: areConversationSlotsCompatible,
    getActiveConversationCount: () => conversations.size
  };
}
