/* Character Social Life — Phase 10
 * Ambient greetings plus face-to-face conversations in Social Hub seating.
 * Conversations use local dialogue only; navigation, tasks and backend data stay untouched.
 */
const ACTIVITY_ICONS = {
  chat: "💬", swing: "🏓", type: "⌨️", read: "📖", run: "🏃",
  lift: "💪", shoot: "🏀", stretch: "🧘"
};

const GENERAL_CONVERSATIONS = [
  [
    { speaker: 0, text: "Akhirnya sempat istirahat juga." },
    { speaker: 1, text: "Iya, dari tadi lumayan sibuk." },
    { speaker: 0, text: "Nanti mau lanjut ke mana?" },
    { speaker: 1, text: "Mungkin balik sebentar ke meja." },
    { speaker: 0, text: "Santai dulu saja, masih ada waktu." },
    { speaker: 1, text: "Betul. Ngobrol sebentar bikin segar." }
  ],
  [
    { speaker: 0, text: "Suasana kantor hari ini ramai, ya." },
    { speaker: 1, text: "Iya, banyak yang sedang dikerjakan." },
    { speaker: 0, text: "Enak juga melihat semua tim aktif." },
    { speaker: 1, text: "Asal koordinasinya tetap lancar." },
    { speaker: 0, text: "Kalau ada yang perlu dibantu, kabari." },
    { speaker: 1, text: "Siap. Terima kasih, ya." }
  ],
  [
    { speaker: 0, text: "Kamu biasanya istirahat di sini?" },
    { speaker: 1, text: "Kalau sedang kosong, iya." },
    { speaker: 0, text: "Tempatnya cukup nyaman." },
    { speaker: 1, text: "Setuju, tidak terlalu ramai." },
    { speaker: 0, text: "Sebentar lagi kita lanjut aktivitas." },
    { speaker: 1, text: "Oke. Semangat lagi!" }
  ]
];

const ROLE_CONVERSATIONS = {
  finance: [
    [
      { speaker: 0, text: "Aku sedang merapikan catatan arus kas." },
      { speaker: 1, text: "Sudah dipisah antara rutin dan investasi?" },
      { speaker: 0, text: "Sudah. Jadi lebih mudah dibandingkan." },
      { speaker: 1, text: "Bagus. Angkanya juga lebih gampang dicek." },
      { speaker: 0, text: "Nanti aku cocokkan lagi dengan laporan." },
      { speaker: 1, text: "Aku bantu periksa bagian akhirnya." }
    ],
    [
      { speaker: 0, text: "Menurutmu risiko portofolio sudah seimbang?" },
      { speaker: 1, text: "Perlu lihat tujuan dan jangka waktunya juga." },
      { speaker: 0, text: "Benar. Jangan hanya mengejar imbal hasil." },
      { speaker: 1, text: "Diversifikasi dan batas risiko tetap penting." },
      { speaker: 0, text: "Aku masukkan itu ke catatan evaluasi." },
      { speaker: 1, text: "Nanti kita telaah bersama." }
    ],
    [
      { speaker: 0, text: "Data dividen tahun ini sudah terkumpul?" },
      { speaker: 1, text: "Sebagian besar sudah, tinggal verifikasi." },
      { speaker: 0, text: "Cek juga konsistensi arus kasnya." },
      { speaker: 1, text: "Siap, supaya tidak terpaku pada yield." },
      { speaker: 0, text: "Setelah itu kita susun ringkasannya." },
      { speaker: 1, text: "Biar mudah dibaca tim." }
    ]
  ],
  content: [
    [
      { speaker: 0, text: "Aku punya ide untuk konten berikutnya." },
      { speaker: 1, text: "Menarik. Pembukanya mau dibuat seperti apa?" },
      { speaker: 0, text: "Langsung ke inti supaya tidak bertele-tele." },
      { speaker: 1, text: "Lalu tambahkan visual yang mudah diingat." },
      { speaker: 0, text: "Aku siapkan beberapa variasi." },
      { speaker: 1, text: "Nanti kita pilih yang paling kuat." }
    ],
    [
      { speaker: 0, text: "Klip kemarin sudah selesai diedit?" },
      { speaker: 1, text: "Sudah. Aku sedang cek audio dan subtitle." },
      { speaker: 0, text: "Pastikan ukuran teks nyaman di ponsel." },
      { speaker: 1, text: "Siap. Sekalian cek bagian pembukanya." },
      { speaker: 0, text: "Kalau rapi, kita jadwalkan unggah." },
      { speaker: 1, text: "Oke, aku siapkan versinya." }
    ],
    [
      { speaker: 0, text: "Ada tren baru yang bisa kita angkat?" },
      { speaker: 1, text: "Ada beberapa, tapi perlu dicek relevansinya." },
      { speaker: 0, text: "Jangan ikut tren hanya karena ramai." },
      { speaker: 1, text: "Setuju. Harus cocok dengan audiens." },
      { speaker: 0, text: "Aku buat daftar ide dan referensi." },
      { speaker: 1, text: "Nanti kita tentukan prioritas." }
    ]
  ],
  technology: [
    [
      { speaker: 0, text: "Otomasi tugas rutin sudah lebih stabil." },
      { speaker: 1, text: "Bagus. Log prosesnya juga sudah tersimpan?" },
      { speaker: 0, text: "Sudah, termasuk catatan saat gagal." },
      { speaker: 1, text: "Berarti lebih mudah ditelusuri." },
      { speaker: 0, text: "Berikutnya aku rapikan notifikasinya." },
      { speaker: 1, text: "Pastikan tidak mengirim pesan berulang." }
    ],
    [
      { speaker: 0, text: "Ada perubahan kecil di alur aplikasi." },
      { speaker: 1, text: "Sudah diuji di ponsel juga?" },
      { speaker: 0, text: "Sudah. Tombol dan panelnya tetap rapi." },
      { speaker: 1, text: "Bagus, jangan sampai desktop saja yang nyaman." },
      { speaker: 0, text: "Aku lanjut cek koneksi datanya." },
      { speaker: 1, text: "Aku pantau hasil pengujiannya." }
    ],
    [
      { speaker: 0, text: "Menurutmu proses ini bisa dipersingkat?" },
      { speaker: 1, text: "Bisa, asal pemeriksaan penting tidak dilewati." },
      { speaker: 0, text: "Aku akan ukur bagian yang paling lambat." },
      { speaker: 1, text: "Lalu optimalkan yang paling berdampak." },
      { speaker: 0, text: "Kita bandingkan sebelum dan sesudah." },
      { speaker: 1, text: "Setuju. Pakai hasil pengukuran." }
    ]
  ],
  research: [
    [
      { speaker: 0, text: "Aku menemukan topik baru untuk dipantau." },
      { speaker: 1, text: "Sumbernya sudah dibandingkan?" },
      { speaker: 0, text: "Sedang dicek dari beberapa referensi." },
      { speaker: 1, text: "Bagus. Pisahkan fakta dan opini." },
      { speaker: 0, text: "Nanti aku tulis ringkasan singkat." },
      { speaker: 1, text: "Sertakan tanggal dan sumbernya juga." }
    ],
    [
      { speaker: 0, text: "Laporan kemarin punya beberapa temuan." },
      { speaker: 1, text: "Mana yang paling penting untuk tim?" },
      { speaker: 0, text: "Yang berdampak pada keputusan operasional." },
      { speaker: 1, text: "Coba urutkan dari dampak terbesar." },
      { speaker: 0, text: "Aku tambahkan tingkat keyakinannya." },
      { speaker: 1, text: "Itu akan membantu saat dibahas." }
    ],
    [
      { speaker: 0, text: "Kita perlu cek perkembangan topik ini lagi." },
      { speaker: 1, text: "Apakah ada data yang benar-benar baru?" },
      { speaker: 0, text: "Belum tentu. Aku akan verifikasi tanggalnya." },
      { speaker: 1, text: "Jangan sampai memakai informasi lama." },
      { speaker: 0, text: "Aku tandai mana yang sudah terkonfirmasi." },
      { speaker: 1, text: "Oke. Baru kita bagikan ke tim." }
    ]
  ]
};

const CROSS_ROLE_CONVERSATIONS = [
  [
    { speaker: 0, text: "Kita bisa saling bantu untuk proyek berikutnya." },
    { speaker: 1, text: "Boleh. Apa yang perlu disiapkan dulu?" },
    { speaker: 0, text: "Aku rangkum kebutuhan dari timku." },
    { speaker: 1, text: "Aku cocokkan dengan alur kerja kami." },
    { speaker: 0, text: "Nanti kita satukan hasilnya." },
    { speaker: 1, text: "Sip. Biar prosesnya lebih lancar." }
  ],
  [
    { speaker: 0, text: "Sepertinya ada peluang kerja sama antarbagian." },
    { speaker: 1, text: "Aku juga melihat hal yang sama." },
    { speaker: 0, text: "Kita mulai dari target yang jelas." },
    { speaker: 1, text: "Lalu tentukan siapa mengerjakan apa." },
    { speaker: 0, text: "Aku kirim poin-poinnya setelah ini." },
    { speaker: 1, text: "Aku tunggu. Kita rapikan bersama." }
  ],
  [
    { speaker: 0, text: "Informasi dari timmu cukup membantu." },
    { speaker: 1, text: "Senang kalau bisa dipakai." },
    { speaker: 0, text: "Aku akan hubungkan dengan pekerjaan kami." },
    { speaker: 1, text: "Kalau ada yang kurang, kabari saja." },
    { speaker: 0, text: "Baik. Kita cek hasilnya bersama." },
    { speaker: 1, text: "Siap, semoga makin efektif." }
  ]
];

const CHESS_CONVERSATIONS = [
  [
    { speaker: 0, text: "Mau satu ronde catur sebelum kembali?" },
    { speaker: 1, text: "Boleh. Kamu mulai dulu." },
    { speaker: 0, text: "Aku coba buka dengan langkah sederhana." },
    { speaker: 1, text: "Aku perhatikan bagian tengah papan." },
    { speaker: 0, text: "Wah, langkahmu cukup mengejutkan." },
    { speaker: 1, text: "Hehe, masih pemanasan." }
  ],
  [
    { speaker: 0, text: "Kamu biasanya suka strategi menyerang?" },
    { speaker: 1, text: "Tergantung posisi. Kadang sabar lebih baik." },
    { speaker: 0, text: "Aku sering terlalu cepat maju." },
    { speaker: 1, text: "Coba amankan langkah berikutnya dulu." },
    { speaker: 0, text: "Baik, kali ini aku lebih hati-hati." },
    { speaker: 1, text: "Nah, sekarang jadi menarik." }
  ],
  [
    { speaker: 0, text: "Permainan tadi hampir membuatku kalah." },
    { speaker: 1, text: "Tapi kamu berhasil bertahan." },
    { speaker: 0, text: "Aku lupa memperhatikan sisi kanan." },
    { speaker: 1, text: "Itu sering terjadi kalau terburu-buru." },
    { speaker: 0, text: "Ronde berikutnya aku lebih fokus." },
    { speaker: 1, text: "Siap. Kita coba lagi nanti." }
  ]
];

const CONVERSATION_POOLS = {
  general: GENERAL_CONVERSATIONS,
  finance: ROLE_CONVERSATIONS.finance,
  content: ROLE_CONVERSATIONS.content,
  technology: ROLE_CONVERSATIONS.technology,
  research: ROLE_CONVERSATIONS.research,
  cross: CROSS_ROLE_CONVERSATIONS,
  chess: CHESS_CONVERSATIONS
};

function agentGroup(character) {
  const id = Number(character?.r?.id);
  if (id >= 1 && id <= 8) return "finance";
  if ([9, 10, 12, 14].includes(id)) return "content";
  if ([11, 15, 16].includes(id)) return "technology";
  if (id === 13) return "research";
  return "general";
}

function conversationPool(a, b, stationKind) {
  if (stationKind === "chess") return CONVERSATION_POOLS.chess;
  const groupA = agentGroup(a), groupB = agentGroup(b);
  if (groupA === "general" && groupB === "general") return CONVERSATION_POOLS.general;
  if (groupA === groupB) return CONVERSATION_POOLS[groupA] || CONVERSATION_POOLS.general;
  return CONVERSATION_POOLS.cross;
}

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
  sprite.position.set(0.34, badgeY + 0.98, 0.04);
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
      let fontSize = 40;
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
        fontSize = 34;
        ctx.font = '700 ' + fontSize + 'px "Nunito",system-ui,sans-serif';
        lines = [lines.slice(0, -1).join(" "), lines[lines.length - 1]];
      }
      const visible = lines.slice(0, 2);
      const firstY = visible.length === 1 ? 96 : 72;
      visible.forEach((text, index) => ctx.fillText(text, 256, firstY + index * 46, 444));
    } else {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = value === "•••" ? 'bold 84px system-ui,sans-serif' : '92px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
      ctx.fillStyle = "#ffffff";
      ctx.fillText(value, 256, 98);
    }
  }

  sprite.userData.currentContent = value;
  sprite.userData.currentKind = kind;
  sprite.userData.texture.needsUpdate = true;
  sprite.scale.set(kind === "text" ? 2.4 : value === "•••" ? 0.92 : 0.72, kind === "text" ? 0.92 : value === "•••" ? 0.56 : 0.45, 1);
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
  const conversationRounds = new Map();
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
          const stationKind = a.slot?.st?.kind || b.slot?.st?.kind || "lounge";
          const pool = conversationPool(a, b, stationKind);
          const round = conversationRounds.get(key) || 0;
          const seed = Math.abs(Number(a.r?.id || 0) * 7 + Number(b.r?.id || 0) * 11);
          const scriptIndex = (seed + round) % pool.length;
          conversationRounds.set(key, round + 1);
          conversation = {
            a, b, startedAt: now, turnStartedAt: now, turnIndex: 0,
            stationKind, scriptIndex, script: pool[scriptIndex]
          };
          /* Give each line enough time to read and keep both guests seated.
             The dwell timer is in seconds; never fast-forward through lines
             when a low-frame-rate device misses an animation frame. */
          const turnDurationSeconds = 4.5;
          const conversationHold = conversation.script.length * turnDurationSeconds + 3;
          [a, b].forEach(character => {
            character.wait = Math.max(Number(character.wait) || 0, conversationHold);
          });
          conversations.set(key, conversation);
        }

        const turnDurationMs = 4500;
        if (now - conversation.turnStartedAt >= turnDurationMs) {
          if (conversation.turnIndex >= conversation.script.length - 1) {
            conversations.delete(key);
            cooldowns.set("c:" + key, now);
            continue;
          }
          /* Advance exactly one turn per update. A suspended or slow frame
             must not skip dialogue that the other agent has not spoken yet. */
          conversation.turnIndex += 1;
          conversation.turnStartedAt = now;
        }

        const turn = conversation.script[conversation.turnIndex];
        const speaker = turn.speaker === 0 ? conversation.a : conversation.b;
        const listener = turn.speaker === 0 ? conversation.b : conversation.a;
        cues.set(speaker, { kind: "text", content: turn.text });
        cues.set(listener, { kind: "listen", content: "•••" });
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
        bubble.scale.set((textBubble ? 2.4 : bubble.userData.currentContent === "•••" ? 0.92 : 0.72) * pulse,
          (textBubble ? 0.92 : bubble.userData.currentContent === "•••" ? 0.56 : 0.45) * pulse, 1);
        bubble.position.y = (character.premiumBadge?.position?.y || character.tag?.position?.y || 2.6) + 0.98 +
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
      conversationLineCount: Object.values(CONVERSATION_POOLS)
        .reduce((sum, pool) => sum + pool.reduce((lines, script) => lines + script.length, 0), 0),
      conversationPoolCount: Object.keys(CONVERSATION_POOLS).length,
      activityCueCount: entries.filter(character => !!character.act || character.busy || character.meeting).length
    };
  }

  return {
    attach,
    update,
    diagnostics,
    canPairSlots: areConversationSlotsCompatible,
    getActiveConversationCount: () => conversations.size,
    getConversationProfile: (a, b, stationKind = "lounge") => {
      const groupA = agentGroup(a), groupB = agentGroup(b);
      const pool = conversationPool(a, b, stationKind);
      return { groupA, groupB, stationKind, scriptCount: pool.length };
    }
  };
}
