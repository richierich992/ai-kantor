/* Living Office — Phase 8
 * Purpose-led idle routing, backend-backed workstation monitors, coordinated
 * multi-division briefings, and Jakarta-time ambience.
 * This module never writes Firebase or Apps Script data.
 */

const ROLE_STATION_PREFERENCES = {
  finance: { reading: 4, chess: 3, cafe: 2, lounge: 2, board: 2, garden: 1, pingpong: 1 },
  content: { cafe: 3, arcade: 3, board: 3, lounge: 2, reading: 1, garden: 1, pingpong: 2 },
  technology: { arcade: 2, chess: 2, reading: 2, pingpong: 2, cafe: 2, lounge: 1, board: 1 },
  research: { reading: 4, garden: 3, chess: 2, board: 2, cafe: 1, lounge: 1, pingpong: 1 }
};

function roleGroup(agentId) {
  const id = Number(agentId);
  if (id >= 1 && id <= 8) return "finance";
  if ([9, 10, 12, 14].includes(id)) return "content";
  if ([11, 15, 16].includes(id)) return "technology";
  return "research";
}

/** Choose a free Social Hub slot using the agent's work profile. */
export function chooseIdleStation(character, freeSlots = []) {
  if (!freeSlots.length) return null;
  const preferences = ROLE_STATION_PREFERENCES[roleGroup(character?.r?.id)] || {};
  const weighted = freeSlots.map(slot => ({
    slot,
    weight: Math.max(1, Number(preferences[slot?.st?.kind]) || 0.7)
  }));
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.slot;
  }
  return weighted[weighted.length - 1].slot;
}

const STATUS_COLORS = {
  RUNNING: "#55b9f3",
  OK: "#63dfaa",
  SUCCESS: "#63dfaa",
  ERROR: "#ff7886",
  FAILED: "#ff7886",
  RETRY: "#f4c56c",
  QUEUED: "#d6b6ff",
  MENUNGGU: "#9cb4c8",
  BELUM_ADA_TUGAS: "#9cb4c8"
};

function safeText(value, max = 56) {
  return String(value ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
}

function jakartaTime() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());
  const hour = Number(parts.find(part => part.type === "hour")?.value || 0);
  const minute = Number(parts.find(part => part.type === "minute")?.value || 0);
  return { hour, minute, text: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` };
}

function dayPart(hour) {
  if (hour >= 5 && hour < 8) return "DAWN";
  if (hour >= 8 && hour < 16) return "DAY";
  if (hour >= 16 && hour < 18) return "GOLDEN";
  return "NIGHT";
}

function createSkyTexture(THREE, top, middle, bottom) {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.53, middle);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 8, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeScreen(THREE, room, agentId) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = new THREE.MeshBasicMaterial({
    map: texture, toneMapped: false, side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.52), material);
  mesh.position.set(1.8, 1.14, -1.995);
  mesh.rotation.x = -0.2;
  mesh.renderOrder = 5;
  mesh.userData.phase8Monitor = true;
  room.g.add(mesh);
  return { canvas, ctx, texture, mesh, agentId, signature: "" };
}

function drawScreen(screen, room, backendAgent, backendReady, localStatus) {
  const ctx = screen.ctx;
  const state = safeText(backendAgent?.state || (backendReady ? "BELUM_ADA_TUGAS" : "NO BACKEND"), 26);
  const color = STATUS_COLORS[state] || (backendReady ? "#9cb4c8" : "#d8ae75");
  const latest = safeText(backendAgent?.message || (room.lock ? room.lastQ : ""), 74);
  const lastRun = safeText(backendAgent?.lastRun || backendAgent?.lastSuccess || "Belum ada data", 32);
  const success = Number(backendAgent?.ok24 || 0);
  const failed = Number(backendAgent?.fail24 || 0);
  const signature = [state, latest, lastRun, success, failed, localStatus].join("|");
  if (signature === screen.signature) return;
  screen.signature = signature;

  ctx.clearRect(0, 0, 640, 360);
  const bg = ctx.createLinearGradient(0, 0, 640, 360);
  bg.addColorStop(0, "#0b1b2c");
  bg.addColorStop(1, "#122e43");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 640, 360);
  ctx.fillStyle = "#183c52"; ctx.fillRect(0, 0, 640, 68);
  ctx.fillStyle = "#e8f7ff"; ctx.font = "800 23px system-ui";
  ctx.fillText("GOSHEN  /  WORKSTATION", 24, 42);
  ctx.fillStyle = "#80a9c0"; ctx.font = "700 13px system-ui";
  ctx.fillText("AGENT " + String(screen.agentId).padStart(2, "0"), 24, 95);

  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(31, 137, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f2f8fc"; ctx.font = "800 22px system-ui";
  ctx.fillText(state.replaceAll("_", " "), 52, 145);

  ctx.fillStyle = "#86a6ba"; ctx.font = "700 13px system-ui";
  ctx.fillText("AKTIVITAS TERAKHIR", 24, 191);
  ctx.fillStyle = "#d5e5ee"; ctx.font = "17px system-ui";
  const text = latest || (backendReady ? "Belum ada aktivitas dari backend" : "Hubungkan URL Apps Script untuk telemetri");
  ctx.fillText(text.slice(0, 58), 24, 220);

  ctx.fillStyle = "#86a6ba"; ctx.font = "700 13px system-ui";
  ctx.fillText("TERAKHIR DIPERBARUI", 24, 270);
  ctx.fillStyle = "#d5e5ee"; ctx.font = "15px system-ui";
  ctx.fillText(lastRun, 24, 296);
  ctx.fillStyle = "#6f93aa"; ctx.font = "13px system-ui";
  ctx.fillText("24 JAM   ✓ " + success + "   /   ✕ " + failed, 24, 337);

  if (localStatus) {
    ctx.fillStyle = "#f1c879";
    ctx.fillRect(478, 85, 138, 28);
    ctx.fillStyle = "#26303a";
    ctx.font = "800 12px system-ui";
    ctx.fillText("LOCAL TASK", 492, 104);
  }
  screen.texture.needsUpdate = true;
}

function createMeetingVisuals(THREE, meetingRoom) {
  if (!meetingRoom?.g || meetingRoom.g.userData.phase8MeetingBuilt) return null;
  meetingRoom.g.userData.phase8MeetingBuilt = true;
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x5edce8, transparent: true, opacity: 0.34, depthWrite: false
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.025, 8, 72), ringMaterial);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.96, 0.5);
  meetingRoom.g.add(ring);

  const canvas = document.createElement("canvas");
  canvas.width = 768; canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.4),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  panel.position.set(0, 3.05, -3.25);
  meetingRoom.g.add(panel);

  function paint(stage = "READY", topic = "Ruang koordinasi lintas divisi", names = []) {
    ctx.clearRect(0, 0, 768, 256);
    const grad = ctx.createLinearGradient(0, 0, 768, 256);
    grad.addColorStop(0, "rgba(8,25,43,.96)");
    grad.addColorStop(1, "rgba(20,64,83,.92)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 768, 256);
    ctx.strokeStyle = "rgba(94,220,232,.8)"; ctx.lineWidth = 4; ctx.strokeRect(3, 3, 762, 250);
    ctx.fillStyle = "#75e2e7"; ctx.font = "800 26px system-ui";
    ctx.fillText("GOSHEN  /  " + stage, 30, 48);
    ctx.fillStyle = "#f1f8fd"; ctx.font = "700 24px system-ui";
    ctx.fillText(topic.slice(0, 48), 30, 106);
    ctx.fillStyle = "#9ec5d6"; ctx.font = "18px system-ui";
    ctx.fillText(names.length ? names.join("  •  ").slice(0, 62) : "Ruang meeting siap digunakan", 30, 164);
    ctx.fillStyle = "#7ba2b7"; ctx.font = "15px system-ui";
    ctx.fillText("LIVE BRIEFING  •  " + jakartaTime().text + " WIB", 30, 215);
    texture.needsUpdate = true;
  }
  paint();
  return { ring, panel, paint };
}

function uniquePush(path, point) {
  if (!point) return;
  const last = path[path.length - 1];
  if (!last || last.distanceTo(point) > 0.18) path.push(point.clone());
}

export function createLivingOffice({
  THREE, scene, rooms, characters, pathOut, pathIn, nearestGap, hallZ, makeVector,
  getBackendAgent, backendReady
}) {
  if (!THREE || !scene || scene.userData.livingOfficePhase8) return null;

  const screens = Object.values(rooms)
    .filter(room => room && !room.meet && typeof room.id === "number")
    .map(room => makeScreen(THREE, room, room.id));

  const meetingRoom = rooms[0];
  const meetingVisuals = createMeetingVisuals(THREE, meetingRoom);

  const sky = {
    DAWN: createSkyTexture(THREE, "#283a53", "#b67e66", "#d2b99a"),
    DAY: createSkyTexture(THREE, "#4b84ad", "#9dc4d0", "#d5ded2"),
    GOLDEN: createSkyTexture(THREE, "#243d5c", "#bd8568", "#e5b98c"),
    NIGHT: createSkyTexture(THREE, "#071426", "#142d48", "#27465a")
  };

  const hemisphere = new THREE.HemisphereLight(0x9ccfe8, 0x304c43, 0.35);
  hemisphere.position.set(0, 30, 0);
  scene.add(hemisphere);
  const fill = new THREE.DirectionalLight(0xffdfb0, 0.2);
  fill.position.set(-28, 36, 18);
  fill.castShadow = false;
  scene.add(fill);
  const entranceGlow = new THREE.PointLight(0x69dbe8, 0.45, 32, 2);
  entranceGlow.position.set(0, 5, 22);
  entranceGlow.castShadow = false;
  scene.add(entranceGlow);
  const socialGlow = new THREE.PointLight(0x8b9cf6, 0.2, 30, 2);
  socialGlow.position.set(-23, 5, 8);
  socialGlow.castShadow = false;
  scene.add(socialGlow);

  let currentPart = "";
  let lastClockText = "";
  let lastScreenUpdate = 0;
  let meetingSequence = 0;
  let meetingState = null;

  const clock = document.createElement("span");
  clock.id = "living-clock";
  clock.className = "living-clock";
  clock.setAttribute("aria-label", "Waktu kantor WIB");
  const headerActions = document.querySelector("#ui > header .r");
  if (headerActions) headerActions.prepend(clock);

  function updateAmbience(force = false) {
    const now = jakartaTime();
    const part = dayPart(now.hour);
    if (force || part !== currentPart) {
      currentPart = part;
      scene.background = sky[part];
      if (scene.fog?.color) {
        const fogColors = { DAWN: 0x9eb7bf, DAY: 0xb1ced0, GOLDEN: 0xc49b86, NIGHT: 0x263d53 };
        scene.fog.color.setHex(fogColors[part]);
      }
      const profiles = {
        DAWN: { hemi: 0.72, fill: 0.58, entrance: 0.55, social: 0.25, sun: 0xffc894 },
        DAY: { hemi: 1.04, fill: 0.78, entrance: 0.18, social: 0.08, sun: 0xfff0d3 },
        GOLDEN: { hemi: 0.72, fill: 0.42, entrance: 0.66, social: 0.34, sun: 0xffb978 },
        NIGHT: { hemi: 0.42, fill: 0.12, entrance: 1.25, social: 0.72, sun: 0x8fbce7 }
      };
      const profile = profiles[part];
      hemisphere.intensity = profile.hemi;
      fill.intensity = profile.fill;
      fill.color.setHex(profile.sun);
      entranceGlow.intensity = profile.entrance;
      socialGlow.intensity = profile.social;
    }

    if (now.text !== lastClockText) {
      lastClockText = now.text;
      if (clock) {
        const label = { DAWN: "FAJAR", DAY: "SIANG", GOLDEN: "SENJA", NIGHT: "MALAM" }[part];
        clock.textContent = label + "  ·  " + now.text + " WIB";
        clock.dataset.period = part.toLowerCase();
      }
    }
    return now;
  }

  function updateScreens() {
    const isBackendReady = typeof backendReady === "function" ? !!backendReady() : false;
    screens.forEach(screen => {
      const room = rooms[screen.agentId];
      const agent = typeof getBackendAgent === "function" ? getBackendAgent(screen.agentId) : null;
      drawScreen(screen, room, agent, isBackendReady, !!room.lock);
    });
  }

  function buildMeetPath(character, seat) {
    const location = character.loc || character.r;
    const path = [];
    uniquePush(path, character.g.position);
    const exit = typeof pathOut === "function" ? pathOut(location) : [];
    (exit || []).forEach(point => uniquePush(path, point));

    const last = path[path.length - 1] || character.g.position;
    if (!location?.row) uniquePush(path, makeVector(last.x, 0, hallZ));
    uniquePush(path, makeVector(31.5, 0, hallZ));
    uniquePush(path, makeVector(31.5, 0, 5.5));
    uniquePush(path, makeVector(30.4, 0, 5.5));
    uniquePush(path, seat);
    return path;
  }

  function buildReturnPath(character, home) {
    const path = [];
    uniquePush(path, character.g.position);
    uniquePush(path, makeVector(30.4, 0, 5.5));
    uniquePush(path, makeVector(31.5, 0, 5.5));
    uniquePush(path, makeVector(31.5, 0, hallZ));

    if (home?.row === "A") {
      uniquePush(path, makeVector(nearestGap(home.front.x), 0, hallZ));
    } else if (home?.front) {
      uniquePush(path, makeVector(home.front.x, 0, hallZ));
    }
    (typeof pathIn === "function" ? pathIn(home) : []).forEach(point => uniquePush(path, point));
    uniquePush(path, home.spot);
    return path;
  }

  function moveCharacter(character, path, face, onDone) {
    return new Promise(resolve => {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        character.done = null;
        if (typeof onDone === "function") onDone();
        resolve();
      };
      character.path = path;
      character.face = face;
      character.done = finish;
    });
  }

  async function runMeeting(agentIds, topic = "Koordinasi lintas divisi") {
    const ids = [...new Set((agentIds || []).map(Number))]
      .filter(id => characters[id] && rooms[id] && id !== 0)
      .slice(0, 3);
    if (ids.length < 2) return { ran: false, message: "" };

    const group = ids.map(id => characters[id]);
    if (group.some(character => character.busy || character.r.lock)) {
      return { ran: false, message: "Briefing dilewati karena ada agent yang sedang menjalankan tugas." };
    }

    meetingSequence++;
    const names = group.map(character => character.r.name);
    const title = safeText(topic, 54) || "Koordinasi lintas divisi";
    const seats = [0, 2.1, 4.2].map(angle => {
      const local = new THREE.Vector3(Math.cos(angle) * 2.3, 0, 0.5 + Math.sin(angle) * 2.3);
      meetingRoom.g.updateMatrixWorld(true);
      return meetingRoom.g.localToWorld(local);
    });

    const homes = new Map(group.map(character => [character, character.r]));
    const originalLocations = new Map(group.map(character => [character, character.loc || character.r]));
    const meetingStarted = performance.now();

    try {
      if (meetingVisuals) meetingVisuals.paint("BRIEFING", title, names);
      group.forEach((character, index) => {
        if (character.slot) {
          character.slot.occ = null;
          character.slot = null;
        }
        character.stroll = null;
        character.yoff = 0;
        character.act = "chat";
        character.busy = true;
        character.meeting = true;
        character.meetingPhase = index * 1.2;
      });

      await Promise.all(group.map((character, index) =>
        moveCharacter(character, buildMeetPath(character, seats[index]),
          Math.atan2(35 - seats[index].x, 5.5 - seats[index].z),
          () => { character.loc = meetingRoom; })
      ));

      if (meetingVisuals) meetingVisuals.paint("LIVE BRIEFING", title, names);
      await new Promise(resolve => setTimeout(resolve, 2400));

      await Promise.all(group.map(character => {
        const home = homes.get(character);
        return moveCharacter(character, buildReturnPath(character, home), home.yaw + Math.PI, () => {
          character.loc = home;
          character.meeting = false;
          character.act = null;
          character.busy = false;
          character.work = character.d.mode === "24h";
          character.wait = 8;
          character.path = [];
        });
      }));

      if (meetingVisuals) meetingVisuals.paint("READY", "Ruang meeting siap digunakan", []);
      return {
        ran: true,
        durationMs: Math.round(performance.now() - meetingStarted),
        message: "Briefing selesai: " + names.join(", ") + " kembali ke workstation."
      };
    } catch (error) {
      group.forEach(character => {
        character.meeting = false;
        character.busy = false;
        character.act = null;
      });
      if (meetingVisuals) meetingVisuals.paint("ATTENTION", "Briefing perlu diulang", names);
      return { ran: false, message: "Briefing tidak selesai: " + safeText(error.message, 90) };
    }
  }

  function updateMeetingCharacters(dt, elapsed) {
    Object.values(characters).forEach(character => {
      if (!character.meeting) return;
      const phase = Number(character.meetingPhase) || 0;
      const wave = Math.sin(elapsed * 1.8 + phase);
      const nod = Math.sin(elapsed * 2.2 + phase * 1.4);
      if (character.armL) {
        character.armL.rotation.y = -0.12 + wave * 0.18;
        character.armL.rotation.z = -0.16 - Math.max(0, wave) * 0.18;
      }
      if (character.armR) {
        character.armR.rotation.y = 0.12 - wave * 0.18;
        character.armR.rotation.z = 0.16 + Math.max(0, -wave) * 0.2;
      }
      character.g.rotation.y += Math.sin(elapsed * 1.2 + phase) * 0.0008;
      character.meetingNod = nod;
    });
    if (meetingVisuals) {
      meetingVisuals.ring.rotation.z += Math.max(0, dt) * 0.16;
      meetingVisuals.ring.material.opacity = 0.28 + 0.09 * (0.5 + 0.5 * Math.sin(elapsed * 1.6));
    }
  }

  function update(dt, elapsed = 0) {
    const now = updateAmbience(false);
    if (performance.now() - lastScreenUpdate > 2600) {
      lastScreenUpdate = performance.now();
      updateScreens();
    }
    updateMeetingCharacters(dt, elapsed);
    return now;
  }

  updateAmbience(true);
  updateScreens();
  scene.userData.livingOfficePhase8 = true;

  return {
    runMeeting,
    update,
    updateScreens,
    get monitorCount() { return screens.length; },
    get meetingSequence() { return meetingSequence; },
    get currentPeriod() { return currentPart.toLowerCase(); }
  };
}
