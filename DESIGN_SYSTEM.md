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
