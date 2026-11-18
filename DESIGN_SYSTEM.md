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
