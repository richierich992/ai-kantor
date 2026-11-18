# Kantor AI — Premium Visual Makeover

## Arah desain
**Premium Futuristic Office Diorama**: perpaduan kantor teknologi modern dengan game 3D bergaya diorama. Kantor menjadi fokus utama; antarmuka berfungsi sebagai HUD yang ringan, tidak mengambil alih ruang visual.

## Identitas visual
- **Palet**: deep navy / ink untuk panel; cyan dan mint untuk status aktif; biru lembut untuk navigasi; emas hangat untuk prioritas dan notifikasi.
- **Material UI**: panel kaca gelap, garis tepi tipis, highlight lembut, bayangan berlapis, radius 14–22 px.
- **Tipografi**: Nunito yang sudah digunakan proyek; hirarki jelas, label teknis kecil, judul tidak berlebihan.
- **Dunia 3D**: gedung kantor modern berpanel kaca, aksen cahaya, tiap divisi punya identitas warna dan dekorasi fungsional.
- **Karakter**: chibi premium dengan wajah/rambut/siluet/aksesori berbeda sesuai peran, bukan hanya beda warna baju.

## Hierarki layar
1. **Top command bar** — identitas, status koneksi, Agent 24 Jam, mode kamera, reset, Command Center, dashboard dan pengaturan.
2. **Division directory** — daftar lima divisi dan pekerja; status agent terlihat sekilas.
3. **3D office stage** — area visual utama untuk bangunan, karakter, lalu lintas aktivitas, dan Social Hub.
4. **Agent side panel** — chat, sumber jawaban, dan status pekerjaan.
5. **Command Center** — satu pintu untuk mengirim tugas ke satu atau beberapa divisi.
6. **Operations dashboard** — antrean, jadwal, log, screener, portofolio, dan pipeline; dibuka saat diperlukan.

## Tahapan implementasi
- **Phase 1 (file ini)**: kulit UI/HUD, login, directory, side panels, modals, command centre, dan responsivitas. Tidak mengubah ID DOM atau kontrak backend.
- **Phase 2 (implementasi awal di branch makeover)**: lapisan arsitektur kaca, rangka fasad, kanopi dan pintu masuk, aksen LED, kaca pembatas divisi, tanaman tepi pintu masuk, pencahayaan area, latar senja, dan framing kamera diorama ditambahkan melalui `premium-world.js`. Scene Three.js asli, hit target ruangan, dan jalur agent tetap digunakan.
- **Phase 3**: pemolesan karakter GLB, animasi idle/kerja/jalan, interaksi dan staging rapat.
- **Phase 4**: Social Hub yang aktif dengan lounge, café, ping-pong, catur, arcade, dan aktivitas idle.
- **Phase 5**: integrasi visual seluruh status backend, accessibility/performance pass, dan regresi fitur.

## Prinsip menjaga fitur yang sudah ada
- Pertahankan ID yang dirujuk JavaScript: `login`, `ui`, `map`, `legend`, `chat`, `dash`, `cfgm`, `cmdb`, `cmdm`, `rview`, dan elemen lainnya.
- Jangan mengubah Firebase paths, payload backend, URL proxy, skema dashboard, atau ID agent hanya untuk kebutuhan visual.
- Perubahan visual tahap pertama ditambahkan sebagai stylesheet terpisah; logika Three.js, Firebase, Apps Script, dan routing AI tetap utuh.

## Status implementasi Phase 2
- Modul arsitektur 3D berdiri sendiri dan dipanggil setelah boot scene lama.
- Objek baru tidak dimasukkan ke daftar raycast `picks`, sehingga tidak mengambil alih klik ruangan/karakter.
- Kamera default dan tombol isometrik/reset diarahkan ke framing gedung baru.
- Preview visual browser dan pengujian interaksi end-to-end masih perlu dilakukan sebelum merge.

## Kriteria penerimaan Phase 1
- Login, header controls, daftar divisi, chat, sumber AI, pengaturan, dashboard, command centre, dan panel divisi tetap memakai handler lama.
- Layout desktop memberi ruang dominan ke scene 3D; panel tidak menutupi bagian utama secara berlebihan.
- Layout mobile tidak membuat header melebar keluar layar; panel menggunakan drawer bawah dan tabel dashboard dapat digeser horizontal.
- Tidak ada API key, token, atau kredensial baru yang ditambahkan ke repository.


### Catatan visual Phase 2
- Kanopi dan pintu kaca baru menggantikan billboard, parapet putih, dan portal lama agar fasad depan tidak tampak bertumpuk.
- Default camera menggunakan sudut diorama yang lebih lebar; kontrol reset dan isometrik mempertahankan interaksi kamera yang sudah ada.


## Status implementasi Phase 3 — karakter AI
- Modul `premium-character.js` menambahkan emblem profesi, ring status di kaki karakter, dan secondary motion untuk idle/kerja/aktivitas sosial.
- GLB profesi yang sudah dipetakan oleh aplikasi tetap menjadi model utama; tidak ada penggantian model atau perubahan agent ID.
- Material GLB dibuat sedikit lebih seimbang agar tidak terlalu kusam, dan pivot anggota tubuh yang tidak tersedia kini diabaikan dengan aman.
- Hook dekorasi berjalan setelah `swapChar` lama; hook animasi berjalan setelah `step` lama. Jalur pergerakan, roam, slot Social Hub, dan gerakan dasar tetap dimiliki kode lama.
- Bounds model dikonversi ke koordinat lokal sebelum emblem/ring diposisikan agar cocok dengan transform karakter.
- Belum ada render browser, validasi visual pada semua 16 GLB, atau uji FPS perangkat; perlu preview sebelum merge.


## Status implementasi Phase 4 — Social Hub
- Modul `premium-social.js` memperkaya stasiun yang sudah ada: café, lounge, reading corner, ping-pong, chess, garden, community board, arcade, dan fitness.
- Penambahan meliputi signage zona, pad dan ring lantai, lampu aktivitas, indikator slot terisi, bola ping-pong animasi, serta uap café.
- Animasi gestur ringan ditambahkan untuk aktivitas chat, swing, type, dan read pada slot sosial.
- Integrasi dilakukan setelah `buildHall()` dan melalui render loop yang sudah ada. Fungsi `roam()`, slot `STN`, `go()`, model furniture GLB, serta rute karakter tidak diganti.
- Efek memakai geometri/material sederhana dan satu update pass per frame; perlu pemeriksaan FPS pada perangkat nyata.
- Belum ada render browser atau uji interaksi end-to-end; PR tetap draft sampai preview visual dan regresi fungsi ditinjau.


## Phase 5 — QA & performance hardening
- Loader manifest dibatasi ke 22 file GLB yang benar-benar ada di folder `assets/`; asset furnitur lama yang tidak tersedia tidak lagi diminta dan fallback procedural tetap dipakai.
- Profil perangkat adaptif: antialias dan pixel ratio lebih rendah pada layar kecil/perangkat dengan 4 core atau kurang; shadow map diturunkan dari 4096 ke 1024 pada profil tersebut dan 2048 pada profil normal.
- Kepadatan traffic dekoratif dikurangi (7/9 unit pada profil rendah, 12/16 pada profil normal) dan render loop berhenti menggambar saat tab tersembunyi.
- Lampu titik per stasiun Social Hub dan per partisi divisi dihapus untuk mengurangi jumlah dynamic lights; ambience tetap melalui emissive/LED, ring, dan pad.
- Emblem profesi sekarang menghormati depth test agar tidak menembus dinding/objek.
- Pemeriksaan dilakukan statis terhadap file, asset, integrasi, dan konfigurasi. Browser render, FPS perangkat nyata, serta end-to-end login/chat/Firebase/Apps Script belum dapat diverifikasi dari audit repository.

- GitHub Actions static QA pada commit `65a7f2534c07a95957d71e8a1998f6663d89fe9f` berhasil: Node syntax checks, import hooks, asset manifest, dan profil performa lulus. Browser/device regression masih menunggu.


## Phase 7 — Premium Game Experience
- Added `premium-experience.js` as a decorative layer for ground/office floor materials, divisional threshold accents, perimeter trim and entrance bollard lighting.
- Added compact camera presets: Overview, Cinematic and Social Hub. Camera motion uses the existing `tg` interpolation and OrbitControls rather than replacing the camera system.
- Camera dock hides while chat or modal panels are open and adapts to mobile width.
- Existing room hit targets, agent IDs, movement paths, Social Hub slots, Firebase paths, AI routing and Apps Script payloads remain owned by the original application.
- Browser preview now checks visibility and activation of all three camera presets on desktop and mobile.


## Phase 8 — Living Office
- Added `premium-living-office.js` for role-weighted Social Hub destination selection, backend-backed workstation telemetry, coordinated multi-division meeting choreography, meeting-room holographic visuals, and Jakarta-time ambience.
- Idle station preferences are role-aware (finance, content, technology, research) while retaining the existing free-slot occupancy and roam scheduler.
- Workstation monitor displays show the latest Apps Script agent state/message/run time and 24-hour success/failure counts. When the backend is not configured, the screens explicitly show that telemetry is unavailable rather than inventing activity.
- Multi-division Command Center routing attempts a physical briefing: selected available agents walk to the existing meeting room, animate discussion, then return to their own desks before existing jobs are dispatched. If an agent is already busy, briefing is skipped and the original task routing continues.
- Ambient sky/fill/entrance/social lighting follows real Jakarta time (dawn, day, golden hour, night). This changes only visual ambience and does not schedule or trigger backend work.
- Existing Firebase paths, agent identities, AI proxy payloads, Apps Script calls, task queue, and Telegram/backend scheduler are not changed.


## Phase 9 — Character Intelligence & Social Life
- Added `premium-social-life.js` with lightweight 3D speech/activity bubbles for working, meeting, reading, typing, exercise and social activities.
- Added proximity-based passing greetings with per-pair cooldowns; greetings are skipped when either character is busy, meeting, locked, or sharing a station.
- Gesture cues use existing character arm groups and do not replace GLB assets, movement routes, activity slots, or backend states.
- Existing Firebase, Apps Script, AI routing, and scheduler paths remain unchanged.


## Phase 10 — Premium Polish
- Added `premium-polish.js` for optional facial morph expressions, subtle head micro-animation, and a restrained selection focus ring.
- Facial controls are discovered by semantic morph-target names and are skipped safely for models without matching rigs; no GLB assets are assumed to contain specific facial channels.
- The layer is render-loop driven, respects current character work/social/meeting state, and does not alter navigation or task state.
- Added browser preview assertions for module initialization on desktop and mobile.


## Phase 11 — AI Office Integration & Operational Diagnostics
- Added `premium-integration.js`, a read-only health snapshot for existing Firebase auth/database, AI proxy URL configuration, and Apps Script bridge availability.
- Diagnostics never make network probes, mutate Firebase, invoke Apps Script, expose credentials, or claim a service is online solely because it is configured.
- The existing application remains the owner of login, AI proxy requests, backend agent state, Apps Script operations, task queue, and Telegram scheduler.
- Browser preview now checks that the integration diagnostics layer initializes and reports the existing agent count.
