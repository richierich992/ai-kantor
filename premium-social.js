/* Premium Social Hub — Phase 4
 * Polishes existing activity stations. Agent routing, slot occupancy and roam()
 * remain owned by index.html; this module only decorates and animates the hub.
 */

const COLORS = {
  cafe: 0xf2c477,
  lounge: 0x87d9d0,
  reading: 0xb4a0f6,
  pingpong: 0x65dce9,
  chess: 0xd9bc91,
  garden: 0x7cdda7,
  board: 0x8bb7ff,
  arcade: 0xb392ff,
  treadmill: 0xffb77d,
  weights: 0xffa46e,
  mat: 0xc5a0ff,
  hoop: 0xffa45e,
  darts: 0xff8e9a
};

const TITLES = {
  cafe: ["CAFÉ", "BREAK • REFRESH"],
  lounge: ["LOUNGE", "RELAX • CONNECT"],
  reading: ["READING CORNER", "LEARN • EXPLORE"],
  pingpong: ["PING-PONG", "PLAY • COMPETE"],
  chess: ["CHESS CLUB", "THINK • STRATEGY"],
  garden: ["ZEN GARDEN", "BREATHE • RESET"],
  board: ["COMMUNITY BOARD", "TEAM UPDATES"],
  arcade: ["ARCADE ZONE", "PLAY • UNWIND"],
  treadmill: ["FITNESS", "MOVE • ENERGIZE"],
  weights: ["FITNESS", "MOVE • ENERGIZE"],
  mat: ["STRETCH ZONE", "RESET • RECOVER"],
  hoop: ["MINI BASKET", "SHOOT • SCORE"],
  darts: ["DARTS", "AIM • FOCUS"]
};

function labelSprite(THREE, title, subtitle, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 192;
  const ctx = canvas.getContext("2d");
  const hex = "#" + new THREE.Color(color).getHexString();

  const bg = ctx.createLinearGradient(0, 0, 768, 192);
  bg.addColorStop(0, "rgba(7,22,37,.96)");
  bg.addColorStop(1, "rgba(17,47,65,.93)");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(7, 7, 754, 178, 34);
  ctx.fill();
  ctx.strokeStyle = hex;
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.roundRect(27, 31, 9, 128, 5);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#f1f8ff";
  ctx.font = "900 42px Nunito, system-ui, sans-serif";
  ctx.fillText(title, 62, 79, 665);
  ctx.fillStyle = "#9ebbd0";
  ctx.font = "800 21px system-ui, sans-serif";
  ctx.fillText(subtitle, 64, 132, 665);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.6, 0.9, 1);
  sprite.renderOrder = 12;
  return sprite;
}

function rotated(yaw, x, z) {
  return [
    x * Math.cos(yaw) + z * Math.sin(yaw),
    -x * Math.sin(yaw) + z * Math.cos(yaw)
  ];
}

function addRing(THREE, scene, station, radius, color) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.035, 7, 64),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.46,
      depthWrite: false
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(station.x, 0.075, station.z);
  ring.renderOrder = 2;
  scene.add(ring);
  return ring;
}

function addFloorPad(THREE, scene, station, radius, color) {
  const pad = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(station.x, 0.026, station.z);
  pad.renderOrder = 1;
  scene.add(pad);
  return pad;
}

function createPingPongBall(THREE, scene, station) {
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.105, 14, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffa347,
      emissive: 0x8b3c08,
      emissiveIntensity: 0.55,
      roughness: 0.35
    })
  );
  ball.castShadow = true;
  scene.add(ball);
  return {
    station,
    ball,
    time: 0,
    wasPlaying: false,
    isResting: false
  };
}

/* A rally only starts when both players have arrived and are doing the
   ping-pong action. A reserved slot or a player still walking is not a game. */
export function pingPongPlayersAreReady(station) {
  const players = (station?.slots || []).filter(slot => {
    const player = slot?.occ;
    const position = player?.g?.position;
    if (!player || slot?.st !== station || player.slot !== slot || player.loc !== slot) return false;
    if (player.act !== "swing" || player.busy || player.meeting || player.path?.length) return false;
    if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.z)) return false;
    // A reserved slot or a character on the way is not a player at the table.
    return Math.hypot(position.x - slot.x, position.z - slot.z) <= 0.65;
  });
  return players.length >= 2;
}

/* Keep the ball on the tabletop while the station is idle. Do not advance its
   timer or rotation until a two-player rally is actually in progress. */
export function updatePingPongBall(item, dt) {
  if (!item?.ball || !item?.station) return false;

  const step = Math.min(0.05, Math.max(0, dt || 0));
  const station = item.station;
  const ball = item.ball;
  const playing = pingPongPlayersAreReady(station);

  ball.visible = true;
  if (!playing) {
    if (!item.isResting) {
      const [rx, rz] = rotated(station.yaw || 0, -0.9, 0.24);
      const surfaceY = Number.isFinite(station.ballSurfaceY) ? station.ballSurfaceY : 1.331;
      ball.position.set(station.x + rx, surfaceY + 0.105, station.z + rz);
      ball.rotation.x = 0;
      ball.rotation.z = 0;
      item.isResting = true;
    }
    item.wasPlaying = false;
    return false;
  }

  item.isResting = false;
  if (!item.wasPlaying) {
    item.time = 0;
    item.wasPlaying = true;
  }
  item.time += step * 2.8;

  /* Small lateral variation keeps the rally from looking like a rigid line. */
  const [rx, rz] = rotated(
    station.yaw || 0,
    Math.sin(item.time) * 0.98,
    Math.sin(item.time * 0.75) * 0.2
  );
  const surfaceY = Number.isFinite(station.ballSurfaceY) ? station.ballSurfaceY : 1.331;
  ball.position.set(
    station.x + rx,
    surfaceY + 0.105 + Math.abs(Math.sin(item.time * 1.75)) * 0.52,
    station.z + rz
  );
  ball.rotation.x += step * 4;
  ball.rotation.z += step * 2.7;
  return true;
}

function chessPawnPair(root, side, file) {
  const base = root?.getObjectByName(side + "_pawn_base_" + file);
  const head = root?.getObjectByName(side + "_pawn_head_" + file);
  return base && head ? [base, head] : null;
}

function updateChessAnimation(item, elapsedSeconds) {
  const root = item.station?.chessVisual;
  if (!root) return false;
  if (!item.pieces) {
    const white = chessPawnPair(root, "white", 4);
    const black = chessPawnPair(root, "black", 4);
    if (!white || !black) return false;
    item.pieces = { white, black };
    item.startedAt = elapsedSeconds;
  }

  /* A small repeating e-pawn exchange makes the chess station visibly alive:
     white advances two squares, black answers, then both reset for another game. */
  const cycle = ((elapsedSeconds - item.startedAt) % 9 + 9) % 9;
  const smooth = value => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  const move = (time, start, finish) => smooth((time - start) / (finish - start));
  /* Start the exchange quickly after agents sit down, then repeat smoothly. */
  let whiteProgress = cycle >= 1.65 && cycle < 6.1 ? 1 : 0;
  if (cycle >= 0.25 && cycle < 1.65) whiteProgress = move(cycle, 0.25, 1.65);
  else if (cycle >= 6.1 && cycle < 7.5) whiteProgress = 1 - move(cycle, 6.1, 7.5);

  let blackProgress = cycle >= 3.8 && cycle < 7.4 ? 1 : 0;
  if (cycle >= 2.4 && cycle < 3.8) blackProgress = move(cycle, 2.4, 3.8);
  else if (cycle >= 7.4 && cycle < 8.8) blackProgress = 1 - move(cycle, 7.4, 8.8);

  const whiteMoving = (cycle >= 0.25 && cycle < 1.65) || (cycle >= 6.1 && cycle < 7.5);
  const blackMoving = (cycle >= 2.4 && cycle < 3.8) || (cycle >= 7.4 && cycle < 8.8);
  const setPiece = (nodes, shift, hop) => nodes.forEach(node => {
    node.position.x = 0;
    node.position.z = shift;
    node.position.y = hop;
  });
  setPiece(item.pieces.white, 0.27 * whiteProgress,
    whiteMoving ? Math.sin(move(cycle, cycle < 1.65 ? 0.25 : 6.1, cycle < 1.65 ? 1.65 : 7.5) * Math.PI) * 0.1 : 0);
  setPiece(item.pieces.black, -0.27 * blackProgress,
    blackMoving ? Math.sin(move(cycle, cycle < 3.8 ? 2.4 : 7.4, cycle < 3.8 ? 3.8 : 8.8) * Math.PI) * 0.1 : 0);
  item.snapshot = {
    cycle,
    whiteZ: item.pieces.white[0].position.z,
    blackZ: item.pieces.black[0].position.z,
    ready: true
  };
  return true;
}

function createSteam(THREE, scene, station) {
  const particles = [];
  const material = new THREE.MeshBasicMaterial({
    color: 0xfff0d9,
    transparent: true,
    opacity: 0.26,
    depthWrite: false
  });
  const geometry = new THREE.SphereGeometry(0.055, 8, 6);
  const [ox, oz] = rotated(station.yaw, 0.6, 0.05);

  for (let i = 0; i < 3; i++) {
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.set(station.x + ox, 1.35 + i * 0.26, station.z + oz);
    scene.add(mesh);
    particles.push({ mesh, phase: i * 1.9 });
  }
  return { station, particles, baseX: station.x + ox, baseZ: station.z + oz };
}

function addOccupancyLights(THREE, scene, station, color) {
  const dots = [];
  const slots = station.slots || [];
  const total = Math.max(2, Math.min(4, slots.length || 2));
  for (let i = 0; i < total; i++) {
    const a = Math.PI * 2 * i / total;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 8, 6),
      new THREE.MeshBasicMaterial({
        color: 0x526b7d,
        transparent: true,
        opacity: 0.8
      })
    );
    mesh.position.set(
      station.x + Math.cos(a) * 1.12,
      0.14,
      station.z + Math.sin(a) * 1.12
    );
    scene.add(mesh);
    dots.push(mesh);
  }
  return dots;
}

function makeZoneSign(THREE, scene, title, subtitle, color, x, y, z, width = 4.5) {
  const sprite = labelSprite(THREE, title, subtitle, color);
  sprite.scale.set(width, width * 0.25, 1);
  sprite.position.set(x, y, z);
  scene.add(sprite);
  return sprite;
}

export function enhanceSocialHub(THREE, scene, stations) {
  if (typeof window !== "undefined") {
    window.__pingPongLogicQA = {
      playersAreReady: pingPongPlayersAreReady,
      updateBall: updatePingPongBall
    };
  }
  if (scene.userData.premiumSocialPhase4) return null;
  scene.userData.premiumSocialPhase4 = true;

  const decor = [];
  const pingPong = [];
  const steam = [];
  const labels = [];
  const chess = (stations || []).filter(s => s.kind === "chess").map((station, index) => ({
    station, startedAt: null, phase: index * 1.7, pieces: null, snapshot: null
  }));
  const arcadeStations = (stations || []).filter(s => s.kind === "arcade");
  const firstArcade = arcadeStations[0];

  (stations || []).forEach(station => {
    if (station.kind === "plant") return;
    if (station.kind === "arcade" && station !== firstArcade) {
      /* One shared floor treatment for the whole arcade row. */
      return;
    }

    const color = COLORS[station.kind] || 0x63d9eb;
    const radius = station.kind === "garden" ? 5.4
      : station.kind === "pingpong" ? 3.3
      : station.kind === "lounge" ? 3.4
      : station.kind === "cafe" ? 2.7
      : station.kind === "board" ? 3.5
      : station.kind === "arcade" ? 7.1
      : station.kind === "hoop" ? 3.4
      : station.kind === "darts" ? 2.6
      : station.kind === "treadmill" ? 3.6
      : 2.7;

    const pad = addFloorPad(THREE, scene, station, radius, color);
    const ring = addRing(THREE, scene, station, radius, color);
    const dots = addOccupancyLights(THREE, scene, station, color);

    const title = TITLES[station.kind];
    let label = null;
    if (title) {
      const [sx, sz] = rotated(station.yaw, 0, 0.35);
      label = labelSprite(THREE, title[0], title[1], color);
      label.position.set(station.x + sx, 4.05, station.z + sz);
      scene.add(label);
      labels.push({ sprite: label, baseY: label.position.y, phase: decor.length * 0.47 });
    }

    decor.push({
      station,
      pad,
      ring,
      dots,
      label,
      phase: decor.length * 0.73,
      color
    });

    if (station.kind === "pingpong") pingPong.push(createPingPongBall(THREE, scene, station));
    if (station.kind === "cafe") steam.push(createSteam(THREE, scene, station));
  });

  /* Small group wayfinding signs make the distributed social area legible. */
  const westCafe = (stations || []).find(s => s.kind === "cafe" && s.x < 0);
  const westGames = (stations || []).find(s => s.kind === "pingpong" && s.x < 0);
  const eastLounge = (stations || []).find(s => s.kind === "lounge" && s.x > 0);
  const eastGames = (stations || []).find(s => s.kind === "arcade");
  if (westCafe) labels.push({
    sprite: makeZoneSign(THREE, scene, "SOCIAL HUB", "CAFÉ • WELLNESS • BREAK", 0xf2c477, -31.5, 6.2, 3.0, 5.2),
    baseY: 6.2, phase: 0.4
  });
  if (westGames) labels.push({
    sprite: makeZoneSign(THREE, scene, "GAME LOUNGE", "PING-PONG • CHESS • GARDEN", 0x65dce9, -23, 6.0, 15.8, 4.7),
    baseY: 6.0, phase: 1.2
  });
  if (eastLounge) labels.push({
    sprite: makeZoneSign(THREE, scene, "RELAX ZONE", "LOUNGE • CONNECT", 0x87d9d0, 23.5, 5.8, 8.0, 4.2),
    baseY: 5.8, phase: 2.1
  });
  if (eastGames) labels.push({
    sprite: makeZoneSign(THREE, scene, "ARCADE", "PLAY • UNWIND", 0xb392ff, 19, 5.9, 19.0, 4.0),
    baseY: 5.9, phase: 2.9
  });

  scene.userData.premiumSocialDecor = { decor, pingPong, chess, steam, labels };
  if (typeof window !== "undefined") {
    window.__chessAnimationQA = {
      snapshot: () => chess.map(item => ({
        x: item.station.x, z: item.station.z, ready: !!item.snapshot?.ready,
        whiteZ: item.snapshot?.whiteZ ?? null, blackZ: item.snapshot?.blackZ ?? null,
        cycle: item.snapshot?.cycle ?? null
      }))
    };
  }
  return scene.userData.premiumSocialDecor;
}

export function updateSocialHub(scene, dt, elapsedSeconds) {
  const state = scene?.userData?.premiumSocialDecor;
  if (!state) return;
  const t = Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0;
  const step = Math.min(0.05, Math.max(0, dt || 0));

  state.decor.forEach(item => {
    const occupied = (item.station.slots || []).filter(slot => !!slot.occ).length;
    const total = Math.max(1, item.dots.length);
    item.dots.forEach((dot, i) => {
      const on = i < occupied;
      dot.material.color.setHex(on ? item.color : 0x526b7d);
      dot.material.opacity = on ? 0.95 : 0.34;
      const pulse = on ? 1 + 0.12 * Math.sin(t * 4 + i) : 1;
      dot.scale.setScalar(pulse);
    });

    const pulse = 0.5 + 0.5 * Math.sin(t * 1.35 + item.phase);
    item.ring.material.opacity = occupied ? 0.58 + 0.16 * pulse : 0.31 + 0.08 * pulse;
    item.pad.material.opacity = occupied ? 0.085 : 0.045;
    item.ring.rotation.z += step * 0.06;
  });

  state.pingPong.forEach(item => updatePingPongBall(item, step));
  state.chess?.forEach(item => updateChessAnimation(item, t));

  state.steam.forEach(group => {
    group.particles.forEach(particle => {
      const phase = (t * 0.32 + particle.phase / (Math.PI * 2)) % 1;
      particle.mesh.position.x = group.baseX + Math.sin(t * 1.15 + particle.phase) * 0.07;
      particle.mesh.position.y = 1.35 + phase * 0.95;
      particle.mesh.position.z = group.baseZ + Math.cos(t * 0.9 + particle.phase) * 0.05;
      particle.mesh.material.opacity = 0.24 * (1 - phase);
      const scale = 0.75 + phase * 1.25;
      particle.mesh.scale.setScalar(scale);
    });
  });

  state.labels.forEach(item => {
    item.sprite.position.y = item.baseY + Math.sin(t * 0.7 + item.phase) * 0.045;
  });
}

/* Lightweight social gestures: arm movement is additive to the original walk,
   run, typing and working animation and is limited to a character's social slot. */
export function animateSocialCharacter(character, dt) {
  if (!character) return;
  const blend = 1 - Math.exp(-Math.min(0.06, Math.max(0, dt || 0)) * 9);
  const t = Number(character.t) || 0;
  const inSlot = !!character.slot && !character.path?.length;
  const act = inSlot ? character.act : null;

  let leftY = 0, rightY = 0, leftZ = 0, rightZ = 0;
  const chessPlayer = act === "chat" && character.slot?.st?.kind === "chess";
  if (chessPlayer) {
    const reach = Math.max(0, Math.sin(t * 2.2));
    rightY = 0.22 + reach * 0.34;
    rightZ = -0.18 - reach * 0.16;
    leftY = -0.16 + Math.sin(t * 1.15 + 1.2) * 0.1;
    leftZ = -0.08;
  } else if (act === "chat") {
    const gesture = Math.max(0, Math.sin(t * 1.7));
    rightY = 0.14 + gesture * 0.22;
    rightZ = -0.12 - gesture * 0.12;
    leftY = -0.06 + Math.sin(t * 0.85 + 1.2) * 0.07;
  } else if (act === "swing") {
    /* A deliberate paddle stroke with visible shoulder, wrist and follow-through
       motion. character.t is the agent's own continuous activity clock. */
    const stroke = Math.sin(t * 0.85);
    leftY = -0.2 + stroke * 0.18;
    rightY = 0.22 - stroke * 0.38;
    leftZ = -0.08 + Math.cos(t * 0.42) * 0.05;
    rightZ = 0.08 + Math.max(0, stroke) * 0.28;
  } else if (act === "type") {
    leftY = -0.1 + Math.sin(t * 12) * 0.035;
    rightY = 0.1 + Math.cos(t * 12) * 0.035;
    leftZ = -0.16;
    rightZ = 0.16;
  } else if (act === "read") {
    leftY = -0.08;
    rightY = 0.08;
    leftZ = -0.08 + Math.sin(t * 0.9) * 0.025;
    rightZ = 0.08 - Math.sin(t * 0.9) * 0.025;
  }

  if (character.armL) {
    if (act === "swing") {
      character.armL.rotation.y = leftY;
      character.armL.rotation.z = leftZ;
      character.armL.rotation.x = -0.92 + Math.sin(t * 0.85 + 0.95) * 0.22;
    } else {
      character.armL.rotation.y += (leftY - character.armL.rotation.y) * blend;
      character.armL.rotation.z += (leftZ - character.armL.rotation.z) * blend;
    }
  }
  if (character.armR) {
    if (act === "swing") {
      const stroke = Math.sin(t * 0.85);
      character.armR.rotation.y = rightY;
      character.armR.rotation.z = rightZ;
      character.armR.rotation.x = -0.96 + Math.cos(t * 0.85) * 0.42;
    } else {
      character.armR.rotation.y += (rightY - character.armR.rotation.y) * blend;
      character.armR.rotation.z += (rightZ - character.armR.rotation.z) * blend;
    }
  }

  const seated = inSlot && !!character.slot?.sit;
  /* The base walking step resets leg pivots every frame. Keep the seat
     transition progress on the character, then write an absolute pose after
     that base step so the knees can actually reach the seated angle. */
  const seatProgress = Number(character._socialSeatProgress) || 0;
  character._socialSeatProgress = seated
    ? Math.min(1, seatProgress + Math.min(0.06, Math.max(0, dt || 0)) * 6)
    : Math.max(0, seatProgress - Math.min(0.06, Math.max(0, dt || 0)) * 8);
  const seatBlend = character._socialSeatProgress;
  if (character.legL) {
    character.legL.rotation.x = -0.92 * seatBlend;
    character.legL.rotation.z = -0.045 * seatBlend;
  }
  if (character.legR) {
    character.legR.rotation.x = -0.92 * seatBlend;
    character.legR.rotation.z = 0.045 * seatBlend;
  }
}
