/* Premium Character Polish — Phase 10
 * Safe optional morph-target expressions, head micro-animation and focus rings.
 * The module never assumes a particular GLB rig or morph naming convention.
 */
const MORPH_RULES = {
  blink: [/blink/i, /eye.?close/i, /close.?eye/i],
  smile: [/smile/i, /happy/i, /grin/i],
  brow: [/brow/i, /think/i, /concern/i]
};

function discoverFaceRig(character) {
  const root = character?.g;
  if (!root) return { morphs: [], heads: [] };
  const morphs = [];
  const heads = [];
  root.traverse(object => {
    if (object.isMesh && object.morphTargetDictionary && object.morphTargetInfluences) {
      const dictionary = object.morphTargetDictionary;
      Object.entries(dictionary).forEach(([name, index]) => {
        const kind = Object.entries(MORPH_RULES).find(([, rules]) => rules.some(rule => rule.test(name)))?.[0];
        if (kind && Number.isInteger(index)) morphs.push({ influences: object.morphTargetInfluences, index, kind });
      });
    }
    if (object !== root && /(^|[_\s-])(head|neck)([_\s-]|$)/i.test(object.name || "")) {
      heads.push({ object, base: object.rotation.clone() });
    }
  });
  return { morphs, heads };
}

function smooth(current, target, dt, speed = 9) {
  return current + (target - current) * (1 - Math.exp(-Math.max(0, Math.min(dt, 0.08)) * speed));
}

function makeFocusRing(THREE, character) {
  const color = new THREE.Color(character.r?.col || "#62d9e7");
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.72, 0.032, 8, 48),
    new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0, depthWrite: false
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.035, 0);
  ring.renderOrder = 4;
  ring.userData.baseColor = color.getHex();
  ring.userData.selected = false;
  character.g.add(ring);
  return ring;
}

export function createPremiumPolish({ THREE, characters = {}, onSelect } = {}) {
  if (!THREE) return null;
  const entries = Object.values(characters).filter(character => character?.g);
  const records = new Map();
  let selectedId = null;

  entries.forEach(character => {
    records.set(character, {
      face: discoverFaceRig(character),
      ring: makeFocusRing(THREE, character),
      blinkAt: performance.now() + 1800 + Math.random() * 2800,
      blinkUntil: 0,
      blinkValue: 0,
      smileValue: 0,
      browValue: 0
    });
  });

  function select(agentId) {
    selectedId = agentId == null ? null : Number(agentId);
    records.forEach((record, character) => {
      record.ring.userData.selected = Number(character.r?.id) === selectedId;
      if (typeof onSelect === "function") onSelect(character.r?.id, record.ring.userData.selected);
    });
    return selectedId;
  }

  function update(dt, elapsed = 0) {
    const now = performance.now();
    records.forEach((record, character) => {
      const isMeeting = !!character.meeting;
      const isSocial = ["chat", "swing", "read", "type"].includes(character.act);
      const isWorking = !!character.busy || (character.work && character.loc === character.r);
      const moodSmile = isMeeting ? 0.28 : isSocial ? 0.22 : isWorking ? 0.08 : 0.12;
      const moodBrow = isMeeting ? 0.12 : isWorking ? 0.18 : 0.04;

      if (now >= record.blinkAt && now >= record.blinkUntil) {
        record.blinkUntil = now + 110;
        record.blinkAt = now + 2800 + Math.random() * 3400;
      }
      const blinkTarget = now < record.blinkUntil ? 1 : 0;
      record.blinkValue = smooth(record.blinkValue, blinkTarget, dt, 30);
      record.smileValue = smooth(record.smileValue, moodSmile, dt, 4);
      record.browValue = smooth(record.browValue, moodBrow, dt, 4);

      record.face.morphs.forEach(morph => {
        const target = morph.kind === "blink" ? record.blinkValue :
          morph.kind === "smile" ? record.smileValue : record.browValue;
        morph.influences[morph.index] = target;
      });

      record.face.heads.forEach(({ object, base }) => {
        const nod = isMeeting ? Math.sin(elapsed * 2 + Number(character.r?.id || 0)) * 0.035 : 0;
        const think = isWorking && !isMeeting ? 0.018 : 0;
        object.rotation.x = smooth(object.rotation.x, base.x + nod + think, dt, 6);
        object.rotation.y = smooth(object.rotation.y, base.y + (isSocial ? Math.sin(elapsed * 1.1) * 0.025 : 0), dt, 5);
      });

      const selected = record.ring.userData.selected;
      const targetOpacity = selected ? 0.7 : 0;
      record.ring.material.opacity = smooth(record.ring.material.opacity, targetOpacity, dt, 12);
      if (selected) {
        const pulse = 1 + 0.035 * Math.sin(elapsed * 3.6);
        record.ring.scale.setScalar(pulse);
        record.ring.material.color.setHex(0xffd779);
      } else {
        record.ring.scale.setScalar(1);
        record.ring.material.color.setHex(record.ring.userData.baseColor);
      }
    });
  }

  function diagnostics() {
    let morphCount = 0, headRigCount = 0;
    records.forEach(record => {
      morphCount += record.face.morphs.length;
      headRigCount += record.face.heads.length;
    });
    return {
      characterCount: entries.length,
      morphChannelCount: morphCount,
      headRigCount,
      selectedId
    };
  }

  return { select, update, diagnostics };
}
