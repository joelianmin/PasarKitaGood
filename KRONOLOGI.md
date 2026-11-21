# Kronologi #4821 dan PK-200: siapa memikirkan, mempertimbangkan, mempelajari, dan melakukan apa

Urutan waktu semua pemangku kepentingan tiket, dari keputusan yang sudah ada sebelum tiket muncul sampai tiket ditutup.
Waktu dalam **WIB** kecuali ditandai UTC.

> **Cara membaca.**
> - **Dilakukan** dan semua **angka** nyata. Masing-masing bisa dicek di Issue, PR, commit, atau berkas yang disebut di kolom Sumber.
> - **Ayu, Bimo, Citra** adalah peran yang dimainkan satu akun (lihat README). Bagian **dipikirkan** dan **dipertimbangkan**
>   mereka disusun dari apa yang mereka tulis di Issue, PR, dan jurnal, bukan karangan baru.
> - **Maya, Eko, Dimas, Bayu, Rudi, Tomi, Tim Platform, Tim Dukungan Penjual** adalah tokoh di dalam tiket dan paket
>   konteks. **Isi pesan** mereka nyata (ada di tiket dan paket konteks). Yang mereka pikirkan, pertimbangkan, pelajari,
>   dan reaksi mereka sesudah tiket ditutup adalah **fiksi yang masuk akal**: tidak tertulis di repo, tetapi tidak
>   bertentangan dengan catatan dan angka nyata. Semua bagian fiksi diberi tanda *(fiktif)*.
> - **Teks asli** tiket dan paket konteks dikutip utuh di titik waktunya, supaya bisa dirujuk tanpa membuka berkas lain.
> - Tinjauan di PR berjarak beberapa detik karena satu akun mengirim komentar berurutan. Di kelompokmu, tinjauan butuh
>   waktu sungguhan; yang ditiru adalah isinya, bukan kecepatannya.

## Pemangku kepentingan

| Siapa | Peran | Muncul di |
| --- | --- | --- |
| Tim Dukungan Penjual | Pelapor #4821 | `labs/latihan/TIKET.md` |
| Maya | Account Manager, pelapor PK-200 | `labs/pk-200/LAB.md` |
| Eko | Senior Developer, memberi usul | `labs/pk-200/LAB.md` |
| Dimas | QA, memberi usul | `labs/pk-200/LAB.md` |
| Bayu | Product, pemilik keputusan flag | `konteks/01`, `konteks/02` |
| Rudi | Front-end | `konteks/02` |
| Tomi | Pemantauan | `konteks/02` |
| Tim Platform | Penyusun anggaran | `konteks/03` |
| Ayu | Pemilik tiket (peran) | Issue #1, #2, #5; PR #3, #4, #6 |
| Bimo | Peninjau 1 (peran) | PR #3, #4, #6 |
| Citra | Peninjau 2 (peran) | PR #3, #6 |

---

## Bagian A. Sebelum tiket ada

Tiga dokumen ini sudah ada sebelum siapa pun membuka tiket. Merekalah yang nanti menentukan perbaikan mana yang boleh.

### 1 Oktober 2026: Tim Platform menyusun anggaran kuartal 4

**Teks asli** (`labs/pk-200/konteks/03-anggaran-infrastruktur.md`):

> **Ringkasan Anggaran Infrastruktur Kuartal 4 2026**
>
> **Disusun oleh:** Tim Platform · **Data per 1 Oktober 2026**
>
> | Pos | Status |
> | --- | --- |
> | Server aplikasi | 8 instance, tidak ada anggaran tambahan kuartal ini |
> | Database | Penambahan memori dianggarkan kuartal 2 tahun 2027 |
> | CDN | Kontrak tetap sampai Juni 2027; biaya dihitung dari lalu lintas ke server gambar |
>
> - Penambahan server aplikasi di luar anggaran memerlukan persetujuan Komite Arsitektur, yang bersidang sebulan sekali.
> - Kenaikan lalu lintas ke server gambar akibat CDN membuat ulang gambar ditagihkan sebagai biaya tambahan.

- **Dilakukan.** Menulis bahwa server aplikasi tetap 8 instance tanpa anggaran tambahan, penambahan di luar anggaran
  butuh Komite Arsitektur yang bersidang sebulan sekali, dan kenaikan lalu lintas server gambar ditagihkan.
- **Dipikirkan** *(fiktif)*. Kuartal lalu tagihan cloud melonjak karena server ditambah setiap kali ada keluhan lambat,
  lalu tidak pernah dikurangi. Biaya harus bisa diramalkan, jadi jalan pintas "tambah mesin" sengaja dibuat lambat.
- **Dipertimbangkan** *(fiktif)*. Melarang total penambahan server terlalu kaku untuk keadaan darurat. Jalan tengahnya
  Komite Arsitektur: tetap bisa, tetapi orang dipaksa menjelaskan mengapa kode tidak bisa diperbaiki dulu.
- **Sumber.** `labs/pk-200/konteks/03-anggaran-infrastruktur.md`

### 12 November 2026: Bayu (Product) dan Tim Desain memutuskan flag tetap menyala

**Teks asli** (`labs/pk-200/konteks/01-keputusan-produk-thumbnail.md`):

> **Keputusan Produk: Thumbnail Dinamis di Profil Toko**
>
> **Tanggal:** 12 November 2026 · **Disetujui:** Bayu (Product), Tim Desain
>
> 1. Flag `seller.dynamic-thumbnail` **tetap menyala**. Uji A/B dua minggu menunjukkan klik produk dari halaman profil toko naik 9%.
> 2. Mematikan flag hanya boleh sebagai langkah darurat sementara, dengan persetujuan Product, dan harus dicatat sebagai insiden.
> 3. Format URL thumbnail di respons profil: `/thumbnails/<id produk>-<kode warna>.jpg`. Format dan isinya **tidak boleh berubah** (lihat thread CDN).

- **Dilakukan.** Memutuskan `seller.dynamic-thumbnail` tetap menyala, mematikannya hanya darurat dengan persetujuan
  Product dan dicatat sebagai insiden, dan format URL thumbnail tidak boleh berubah.
- **Dipertimbangkan.** Hasil uji A/B dua minggu: klik produk dari profil toko naik 9%.
- **Dipikirkan** *(fiktif)*. Bayu pernah melihat fitur bagus dimatikan "sementara" saat ada keluhan lalu tidak pernah
  dinyalakan lagi. Karena itu mematikan flag dibuat mahal secara prosedur: butuh persetujuan Product dan dicatat sebagai
  insiden. Ia tidak menulis apa pun soal kecepatan, karena uji A/B berjalan dengan lalu lintas kecil dan tidak ada yang
  mengeluh.
- **Sumber.** `labs/pk-200/konteks/01-keputusan-produk-thumbnail.md`

### 13 November 2026, 09.15 sampai 09.41: thread #infra-cdn

**Teks asli** (`labs/pk-200/konteks/02-thread-cdn.md`):

> **Thread #infra-cdn**
>
> **Rudi (Front-end), 13 Nov 2026, 09.15**
> CDN menyimpan gambar thumbnail berdasarkan URL persisnya. Kalau `<kode warna>` di URL berubah, CDN menganggapnya gambar baru dan membuat ulang semuanya dari awal.
>
> **Tomi (Pemantauan), 09.22**
> Terakhir kali itu terjadi, lalu lintas ke server gambar naik delapan kali lipat selama dua hari. Mohon jangan sampai terulang.
>
> **Bayu (Product), 09.30**
> Dicatat. URL thumbnail yang sudah ada dianggap kontrak dengan CDN dan aplikasi mobile.
>
> **Rudi, 09.41**
> Satu lagi: aplikasi menampilkan thumbnail profil dalam ukuran 200 x 200 piksel. Gambar 1600 x 1600 hanya dipakai untuk fitur zoom di halaman detail produk.

| Jam | Siapa | Isi pesan | Dipikirkan *(fiktif)* |
| --- | --- | --- | --- |
| 09.15 | Rudi | CDN menyimpan gambar berdasarkan URL persis; kode warna berubah berarti semua gambar dibuat ulang | Mencegah perubahan kecil di backend menjadi masalah besar di CDN |
| 09.22 | Tomi | Terakhir kali, lalu lintas server gambar naik delapan kali selama dua hari | Pernah mengalaminya; tidak mau terulang |
| 09.30 | Bayu | URL thumbnail dianggap kontrak dengan CDN dan aplikasi mobile | Mengubah kebiasaan menjadi aturan |
| 09.41 | Rudi | Profil menampilkan 200 x 200; 1600 x 1600 hanya untuk zoom di detail produk | Rudi menulisnya karena heran mengapa backend repot membuat gambar sebesar itu, tapi tidak ada yang membalas. Informasi samping ini ternyata kunci perbaikan |

- **Sumber.** `labs/pk-200/konteks/02-thread-cdn.md`

---

## Bagian B. Jumat 20 November 2026: diagnosis #4821

### 19.10 sampai 19.13: Ayu menyiapkan kerja sebelum mengukur

- **Dilakukan.** Membuat repo dari templat (19.10). Menulis rencana sesi di Issue #1 dan menulis ulang #4821 dengan
  kata-kata sendiri di Issue #2 (19.12). Membuka PR #3 sebagai draf dan mulai laporan dari templat (19.13).
- **Dipikirkan.** Risiko terbesar bukan kodenya, tetapi laptop jenuh saat kondisi menyala, `task traffic` mencampuri
  angka k6, dan pembaruan templat untuk PK-200 belum tersedia.
- **Dipertimbangkan.** Untuk setiap risiko, ditulis **tanda** yang bisa diamati dan **rencana B**: `RATE=1` bila k6
  mencatat gagal; traffic hanya untuk Grafana dan dihentikan sebelum k6; jurnal dan kode PK-200 dibaca dulu bila folder
  lab belum ada.
- **Dugaan awal di Issue #2** (ditandai belum terbukti): query produk untuk toko besar lambat; ada perubahan konfigurasi.
- **Sumber.** Issue #1, Issue #2, PR #3, commit `c9a2714`, `df59a69`

### 19.14 sampai 19.18: Ayu mengukur patokan sebelum kondisi menyala

- **Dilakukan.** Aplikasi menyala 19.14.56. k6 dengan kondisi mati pada 19.15.15: p50 11,4 ms, p95 18,8 ms, 0 dari 361 gagal.
- **Dipikirkan.** Tanpa angka "normal", kata "lambat" tidak bisa dibuktikan.
- **Sumber.** `labs/latihan/LAPORAN-4821.md` bukti 1

### 19.18.58: kondisi dinyalakan (`task latihan:mulai`)

- **Dilakukan.** Ayu mencatat jamnya dalam WIB dan UTC (12.18.58 UTC), lalu menjalankan `task traffic` untuk Grafana.
- **Dipikirkan.** Grafana memakai UTC; jam yang dicatat di dua zona mencegah salah baca panel.

### 19.28: Tim Dukungan Penjual melaporkan #4821

**Teks asli** (`labs/latihan/TIKET.md`):

> **Tiket #4821: Halaman profil toko terasa lambat**
>
> | | |
> | --- | --- |
> | Dari | Tim Dukungan Penjual |
> | Prioritas | Sedang |
> | Dilaporkan | Pada **jam tiket** (WIB): jam yang dicetak oleh `task latihan:mulai` sebagai "Tiketmu melaporkan masalah sekitar pukul ..." |
> | Komponen | PasarKita, halaman profil toko (`GET /api/sellers/{id}/profile`) |
>
> **Keluhan.** Beberapa penjual menghubungi dukungan dan bilang halaman profil toko mereka
> terasa sangat lama dibuka, sampai beberapa detik. Kemarin masih cepat. Keluhan paling banyak
> datang dari toko yang produknya banyak.
>
> **Yang kami tahu.**
> - Halaman lain (katalog, pencarian, keranjang) tidak dikeluhkan.
> - Tidak ada rilis kode yang tercatat hari ini. Kami tidak bisa memastikan apakah ada perubahan
>   konfigurasi.
> - Belum jelas apakah semua toko terdampak atau hanya sebagian.
>
> **Yang diminta.** Pahami apa yang sebenarnya terjadi dan di lapisan mana. Kumpulkan bukti dari
> lebih dari satu sumber, tulis hipotesismu, dan catat apa yang belum kamu ketahui. **Jangan
> memperbaiki apa pun.**
>
> **Catatan.**
> - Waktu pada tiket ini dalam WIB. Alat ukur kita mungkin memakai zona waktu lain.
> - Tidak semua yang muncul di log dan grafik berhubungan dengan tiket ini.
> - Daftarkan tiket ini sebagai Issue di repo kelompok (templat "Tiket kerja"), dengan kata-katamu
>   sendiri, dan beri penanggung jawab.

- **Isi laporan.** Beberapa penjual bilang profil toko butuh beberapa detik; kemarin masih cepat; toko dengan produk banyak
  paling sering mengeluh.
- **Dipikirkan** *(fiktif)*. Petugas dukungan menerima tiga keluhan serupa dalam satu jam dan ragu apakah ini masalah
  jaringan penjual. Ia mencoba sendiri membuka profil toko besar dan kecil; toko besar terasa jauh lebih lama. Ia menulis
  apa yang dirasakan, bukan penyebabnya, karena tidak tahu penyebabnya.
- **Dipertimbangkan** *(fiktif)*. Prioritas "tinggi" atau "sedang". Ia memilih sedang: halaman lain normal dan pembeli
  masih bisa berbelanja.
- **Sumber.** `labs/latihan/TIKET.md`

### 19.31 sampai 19.38: Ayu mengukur gejala dan laptop jenuh

- **Dilakukan.** Traffic dihentikan 19.31, **sebelum** k6. Run 2 req/detik pada 19.32: 12,5% gagal, p95 40 s.
  Run 1 req/detik pada 19.37: 0 gagal, p50 613 ms, p95 1,67 s.
- **Dipikirkan.** Angka 2 req/detik mengukur antrean di laptop 2 core, bukan halaman profil. Rencana B (`RATE=1`) yang
  sudah ditulis jam 19.12 berlaku.
- **Dipertimbangkan.** Membuang angka 2 req/detik atau menyimpannya. Keputusan: disimpan sebagai bukti 2, diberi tanda
  "mengukur antrean", dan tidak dipakai sebagai ukuran gejala.
- **Sumber.** Laporan bukti 2 dan 3

### Sesudah 19.38: Ayu mencari di mana waktunya habis

- **Dilakukan.** `curl` 10 request: penjual 1 (60 produk) 1.403 ms, penjual 2 dan 77 (25 produk) 665 dan 592 ms.
  `pg_stat_statements`: 2 query per request, keduanya di bawah 1 ms. `ps`: CPU aplikasi sampai 339,5%.
  Tabel `feature_flag`: `seller.dynamic-thumbnail = t`. Kode: `ThumbnailService` membuat gambar 1600 x 1600 untuk setiap
  produk hanya untuk membaca satu piksel.
- **Dipelajari.** Dugaan "query produk lambat" **gugur**. Waktu sebanding jumlah produk (60/25 = 2,4; 1.403 ms dibagi rata-rata
  628 ms = 2,2), jadi biaya terjadi per produk, di CPU aplikasi.
- **Dipertimbangkan.** WARN `legacy.timeout` di log. Diabaikan karena sudah muncul 54 baris tiap 30 detik **sejak sebelum**
  kondisi menyala; ditulis di bagian "Yang diabaikan" beserta alasannya.
- **Sumber.** Laporan bukti 6 sampai 10, bagian "Yang diabaikan"

### 19.42: Ayu menulis laporan dan komentar progres

- **Dilakukan.** Commit `9ba1d88`: gejala, reproduksi, sepuluh bukti, dua hipotesis bertanda "belum terbukti",
  keterbatasan. Komentar progres di Issue #2.
- **Dipikirkan.** Hipotesis belum diuji langsung, jadi tidak ditulis sebagai akar masalah pasti. Ujinya dimasukkan ke
  "Langkah berikutnya": matikan flag lalu ukur, dan ukur `thumbnailFor` sendiri.
- **Sumber.** Commit `9ba1d88`, Issue #2

### 19.43 sampai 19.44: Bimo dan Citra meninjau PR #3

| Jam | Siapa | Dilakukan | Dipikirkan |
| --- | --- | --- | --- |
| 19.43.24 | Bimo | Meminta satu perubahan | Prometheus menulis CPU 35%, `ps` menulis 339%. Pembaca bisa menyimpulkan CPU "hanya 35%" bila satuannya tidak ditulis |
| 19.43 | Ayu | Commit `ea3fe4a`: satuan ditulis di bukti 5 dan 6, lalu membalas | Satuan berbeda, bukan angka yang bertentangan: seluruh mesin = 100% vs per core = 400% |
| 19.43.57 | Citra | Setuju | Memeriksa yang belum disentuh Bimo: jam. 19.18.58 WIB = 12.18.58 UTC, dan titik 12.20 di panel `rate(...[1m])` mewakili jendela 12.19 sampai 12.20 |
| 19.43.59 | Bimo | Setuju | Membaca ulang tabel bukti; tidak ada yang bertentangan lagi |
| 19.44.03 | Ayu | Menggabungkan PR #3; Issue #2 tertutup | |

- **Dipelajari.** Dua peninjau berguna bila memeriksa hal yang berbeda dan menyebut apa yang mereka periksa.
- **Sumber.** Komentar PR #3, commit `ea3fe4a`

### 19.44: penutupan #4821 dan titik cek

- **Dilakukan.** Ayu menulis penutupan Issue #2 (akar masalah sebagai hipotesis kuat, tabel sinyal, tindak lanjut ke
  PK-200) dan komentar **Cek 19.44** di Issue #1.
- **Hambatan yang dicatat.** Pembaruan templat (`labs/pk-200`) belum tersedia. Rencana B ketiga berlaku.
- **Sumber.** Issue #2, Issue #1

### 19.45 Jumat sampai 07.30 Sabtu: jeda

Tidak ada kerja. Ayu menunggu pembaruan templat. Jeda ini nanti dicatat terbuka di komentar **Perubahan**.

---

## Bagian C. Sabtu 21 November 2026: perbaikan PK-200

### 07.30: Ayu mengambil pembaruan templat (PR #4)

- **Dilakukan.** Mengikuti `docs/PANDUAN-PEMBARUAN.md` lewat cabang dan PR.
- **Dipikirkan.** Pembaruan tidak boleh menimpa pekerjaan kelompok.
- **Bimo memeriksa.** 9 berkas, semuanya di `labs/` dan `docs/`; berkas alat tidak berubah; `LAPORAN-4821.md` dan
  `group.env` tidak tersentuh. Setuju.
- **Sumber.** PR #4, commit `07902d1`

### 07.31: Ayu membaca tiket PK-200 dan menulis prediksi

**Teks asli** (`labs/pk-200/LAB.md`):

> **PK-200: Profil toko lambat sejak thumbnail dinamis dinyalakan**
>
> > **Maya, Account Manager (Senin, 10.05):** Toko Raksasa dan beberapa toko lain mengeluh halaman profil toko mereka butuh beberapa detik untuk dibuka. Diagnosisnya sudah ada di tiket #4821.
>
> > **Eko, Senior Developer (10.20):** Matikan saja flag thumbnail-nya, beres.
>
> > **Dimas, QA (10.40):** Atau tambah server aplikasi supaya kuat?
>
> **Yang diharapkan**
>
> - p95 `GET /api/sellers/{id}/profile` pada 2 req/detik dengan flag `seller.dynamic-thumbnail` menyala tidak lebih dari dua kali p95 saat flag mati, diukur di laptop yang sama.
> - Tidak ada request yang gagal pada 2 req/detik.
> - Respons profil tidak berubah selama flag menyala.

Isi tiket (di dalam cerita, Senin):

| Jam | Siapa | Isi pesan | Dipikirkan *(fiktif)* | Bagaimana Ayu menilainya |
| --- | --- | --- | --- | --- |
| 10.05 | Maya | Toko Raksasa dan toko lain mengeluh; diagnosis sudah ada di #4821 | Toko Raksasa penjual terbesar yang ia pegang, dan pemiliknya sudah menelepon dua kali. Ia tidak paham teknisnya, jadi menautkan #4821 supaya developer tidak mulai dari nol | Konteks: menyambung ke Issue #2 |
| 10.20 | Eko | Matikan saja flag thumbnail-nya | Ia membaca #4821, melihat flag menyala tepat sebelum lambat, dan menyimpulkan flag itu biang masalahnya. Ia tidak tahu keputusan produk 12 Nov karena tidak ikut rapatnya | Solusi titipan; diperiksa terhadap paket konteks |
| 10.40 | Dimas | Atau tambah server aplikasi | Di uji beban QA, menambah instance biasanya menurunkan p95. Ia mengira masalahnya kapasitas, bukan biaya per request | Solusi titipan; diperiksa terhadap paket konteks |

Kolom "Dipikirkan" di tabel ini *(fiktif)*.

- **Dilakukan.** Membuka Issue #5 dan PR #6. Menulis tiga prediksi di `JURNAL.md` **sebelum** mengukur apa pun (commit `d44210e`):
  1. Waktu habis di `thumbnailFor`, sekitar 1 detik untuk 60 produk.
  2. Mematikan flag memulihkan kecepatan, tetapi mengubah respons.
  3. Membuat gambar langsung kecil akan **mengubah URL**, jadi tidak boleh dipakai.
- **Dipikirkan.** Prediksi ditulis lebih dulu supaya hasil pengukuran bisa membuktikannya salah, bukan menyesuaikannya.
- **Sumber.** Issue #5, `labs/pk-200/JURNAL.md` bagian 1

### 07.31 sampai 07.47: Ayu membaca paket konteks dan mengukur

- **Dilakukan, membaca.** Daftar asumsi di jurnal: flag tetap menyala (keras), URL tidak boleh berubah (keras), tidak ada
  anggaran server (keras), alasan biaya CDN (konteks), profil hanya 200 x 200 (konteks).
- **Dipikirkan.** Dua usul di tiket datang sebelum siapa pun menyebut penyebab. Keduanya ditolak oleh **dokumen
  konteks**, bukan oleh pendapat Ayu: usul Eko melanggar keputusan Bayu, usul Dimas melanggar anggaran. Usul Dimas juga
  tidak membuat **satu** request lebih cepat dari 1 detik.
- **Dilakukan, mengukur.**

| Jam | Ukuran | Hasil |
| --- | --- | --- |
| 07.31 | Flag mati, 2 req/detik (patokan) | Penjual 1 p95 22 ms, lain 23 ms, 0 gagal |
| 07.35.36 | `task latihan:mulai` | Flag menyala |
| 07.35 | Flag menyala, 2 req/detik | 40,7% dan 35,9% gagal; CPU 137 sampai 299% per core |
| 07.41 | Flag menyala, 1 req/detik | Penjual 1 p50 1.741 ms; `curl` 2.373 ms |
| sesudahnya | JSON flag mati vs menyala | `thumbnail` berbeda di 60, 25, 25 produk: prediksi 2 **benar** |
| sesudahnya | `BandingThumbnail.java`, 255 warna | 60 thumbnail 934 ms vs 16 ms: prediksi 1 **benar**. URL berbeda 0 dari 255: prediksi 3 **salah** |

- **Dipelajari.** Prediksi 3 terasa pasti, tetapi salah. Warna hanya bergantung pada `productId * 37 % 255`; karena 37 dan
  255 tidak punya faktor bersama, produk 1 sampai 255 mencakup **semua** kemungkinan warna. Ujinya lengkap, bukan sampel.
- **Juga dicatat, belum terjelaskan.** Run Sabtu lebih lambat daripada run Jumat untuk kondisi yang sama (2.373 vs 1.403 ms).
- **Sumber.** `JURNAL.md` bagian 2 sampai 4, `labs/pk-200/BandingThumbnail.java`, commit `2489551`

### 07.47: Ayu membandingkan alternatif dan memilih

| Alternatif | Pertimbangan | Keputusan |
| --- | --- | --- |
| A. Matikan flag (Eko) | Melanggar keputusan produk; URL di respons berubah | Ditolak |
| B. Tambah server (Dimas) | Melanggar anggaran; satu request tetap lebih dari 1 detik | Ditolak |
| C. Simpan hasil per produk | Memenuhi batasan, tetapi hanya menutupi biaya; request pertama tetap lambat; memori bertambah | Disimpan sebagai cadangan |
| D. Gambar langsung 200 x 200 | Menghapus pekerjaan 1600 x 1600; URL sama untuk 255 dari 255 warna | **Dipilih** |

- **Dipikirkan.** Sebelum uji 255 warna, D hampir ditolak karena prediksi 3. Tanpa uji itu, pilihan jatuh ke C.
- **Dilakukan juga.** Komentar **Perubahan 07.47** di Issue #1: apa yang berubah (sesi terbelah semalam), pemicunya
  (pembaruan templat terlambat), dan yang dikorbankan (tidak ada tiket dibatalkan; angka Jumat dan Sabtu dibandingkan
  dengan hati-hati).
- **Sumber.** `JURNAL.md` bagian Alternatif, Issue #1

### 07.48 sampai 07.49: Ayu menulis test dulu, baru kode

| Jam | Commit | Dilakukan | Dipikirkan |
| --- | --- | --- | --- |
| 07.48 | `48cab1c` | `ThumbnailServiceTest` membandingkan layanan dengan salinan cara lama untuk 255 warna dan tiga id besar. Lulus pada kode lama | Test yang lulus pada kode lama membuktikan ia menjaga perilaku lama, bukan dibuat menyesuaikan kode baru |
| 07.49 | `0f51d95` | `ThumbnailService` membuat gambar langsung 200 x 200. Test yang sama tetap lulus | Satu berkas diubah, mudah dibatalkan |

- **Sumber.** Commit `48cab1c`, `0f51d95`, `src/test/java/id/pasarkita/catalog/ThumbnailServiceTest.java`

### 07.50 sampai 07.57: Ayu mengukur ulang dengan flag tetap menyala

- **Dilakukan.** Aplikasi dijalankan ulang dari cabang `pk-200`.
  - 1 req/detik (07.50): penjual 1 p95 52 ms.
  - 2 req/detik (07.53): penjual 1 p95 **39 ms**, penjual lain 25 ms, 0 gagal; CPU 0,8 sampai 9,3%.
  - `cmp` JSON penjual 1, 2, 77 sebelum dan sesudah: **sama persis**.
  - `task evidence LAB=pk-200` (07.57) dari commit `0f51d95` dengan pohon kerja bersih. Berkasnya dilampirkan, tidak di-commit.
- **Dipertimbangkan.** Target "≤ 2 x patokan" hanya sah bila patokan dan hasil diukur di hari dan laptop yang sama. Karena
  itu Ayu memakai patokan Sabtu 07.31, bukan angka Jumat: 39 ≤ 44 ms dan 25 ≤ 46 ms.
- **Sumber.** `JURNAL.md` bagian Perbaikan, komentar bukti di PR #6, commit `83ec219`, `1a05fc0`

### 07.58 sampai 07.59: Bimo dan Citra meninjau PR #6

| Jam | Siapa | Diperiksa | Dipikirkan dan diputuskan |
| --- | --- | --- | --- |
| 07.59.05 | Bimo | `grep thumbnailFor` (hanya satu pemanggil), test lulus 2 dari 2, urutan commit test lalu kode, bukti dari `0f51d95`, batasan bersumber | Minta selisih Jumat-Sabtu dipindah dari jurnal ke tindak lanjut penutupan, supaya tidak hilang |
| 07.59.07 | Ayu | | Setuju. Selisih itu tidak memengaruhi kesimpulan karena target dibandingkan di hari yang sama |
| 07.59.08 | Citra | Perhitungan 2 x patokan, klaim PR, `cmp` dan test 255 warna | Klaim dibatasi dengan benar: penjual 1 masih 17 ms di atas patokan karena 60 thumbnail tetap dibuat. Setuju |
| 07.59.10 | Bimo | Jawaban Ayu | Setuju |
| 07.59.28 | Ayu | Menggabungkan PR #6 | |

- **Sumber.** Komentar PR #6

### 07.59: penutupan PK-200 dan refleksi sesi

- **Dilakukan.** Ayu menulis penutupan Issue #5: akar masalah, sinyal di tiket dan statusnya, batasan beserta berkas
  sumbernya, alternatif, hasil, bukti, dan empat tindak lanjut (selisih Jumat-Sabtu, sisa 17 ms, belum diukur di skala M,
  `feature_flag` tanpa waktu perubahan). Lalu **Refleksi** dan menutup Issue #1.
- **Dipelajari (dari refleksi).**
  - Yang paling meleset bukan ukuran tiket, tetapi ketergantungan pada pembaruan templat.
  - Langkah paling berguna adalah menguji prediksi 3 sebelum memilih.
  - Ke depan, "folder lab belum ada setelah `git fetch templat`" ditulis sebagai risiko tersendiri di setiap rencana.
- **Sumber.** Issue #5, Issue #1

### Yang didapat pemangku kepentingan lain dari penutupan

| Siapa | Kekhawatirannya (dari pesannya) | Jawabannya di penutupan |
| --- | --- | --- |
| Maya, Tim Dukungan Penjual | Profil toko lambat | Penjual 1 p95 dari sekitar 57 s menjadi 39 ms pada 2 req/detik |
| Eko | Gejala cepat hilang | Gejala hilang tanpa mematikan flag; usulnya ditolak dengan alasan dari keputusan produk |
| Dimas | Kapasitas | Tanpa server tambahan, CPU turun dari 137-299% menjadi 0,8-9,3% |
| Bayu | Flag tetap menyala | Flag menyala selama semua pengukuran sesudah perbaikan |
| Rudi, Tomi | URL tidak berubah, CDN tidak membuat ulang gambar | Test 255 warna dan `cmp` 3 penjual: URL sama persis |
| Tim Platform | Anggaran | Perbaikan hanya kode, satu berkas |

---

## Bagian D. Sesudah penutupan *(fiktif)*

Seluruh bagian ini fiksi yang masuk akal: tidak ada di Issue atau PR, tetapi setiap angka yang disebut berasal dari
catatan nyata di atas.

| Siapa | Yang dilakukan | Yang dipikirkan | Yang dipelajari |
| --- | --- | --- | --- |
| Maya | Mengabari pemilik Toko Raksasa bahwa profil sudah cepat lagi dan fitur thumbnail tetap ada | Lega bisa menjawab "sudah beres" dengan angka, bukan janji | Menautkan tiket diagnosis (#4821) menghemat waktu; developer tidak mulai dari nol |
| Eko | Membaca penutupan Issue #5 | Usulnya akan menghentikan gejala, tetapi juga mengubah `thumbnail` di 60 produk penjual 1 dan memicu CDN membuat ulang gambar | Gejala yang hilang belum tentu masalah selesai; sebelum mengusulkan, cek dulu keputusan dan kontrak yang berlaku |
| Dimas | Menambahkan skenario "satu request ke toko besar" ke daftar uji QA | Pada 1 req/detik pun satu request penjual 1 butuh lebih dari 1 detik. Server tambahan tidak bisa mempercepat satu request | Bedakan biaya per request dari kapasitas; ukur satu request sebelum menambah mesin |
| Bayu | Menambahkan syarat baru untuk fitur berikutnya: uji A/B juga mencatat waktu respons | Uji A/B dua minggu membuktikan klik naik 9%, tetapi tidak ada yang mengukur kecepatannya | Keputusan produk perlu ukuran kinerja, bukan hanya ukuran bisnis |
| Rudi | Membalas thread #infra-cdn bahwa URL tidak berubah dan dibuktikan dengan test 255 warna | Komentarnya soal 200 x 200, yang dulu tidak dibalas siapa pun, ternyata menjadi dasar perbaikan | Informasi tentang cara data dipakai di layar layak ditulis, walau terlihat sepele |
| Tomi | Memantau lalu lintas server gambar dua hari sesudah perbaikan dirilis | Khawatir kejadian "naik delapan kali" terulang; ternyata datar | Test yang membandingkan URL lama dan baru lebih menenangkan daripada janji |
| Tim Platform | Mencatat kasus ini sebagai contoh di panduan permintaan server | Permintaan server tambahan seperti ini akan ditolak Komite karena penyebabnya biaya per request | Anggaran yang ketat mendorong orang mencari akar masalah |
| Ayu | Menulis risiko "folder lab belum ada" di rencana berikutnya | Hampir saja memilih cache karena prediksi 3 | Prediksi yang terasa pasti justru yang paling perlu diuji |
| Bimo | Menambahkan "satuan sama?" ke daftar periksa tinjauannya | Dua kali ia menangkap hal yang hampir hilang: satuan CPU, lalu selisih Jumat-Sabtu | Tugas peninjau juga menjaga hal yang belum terjelaskan supaya tidak hilang |
| Citra | Membagi tugas tinjauan dengan Bimo sejak awal di PR berikutnya | Tinjauannya berguna justru karena memeriksa hal yang tidak diperiksa Bimo | Dua peninjau yang memeriksa hal sama hanya memberi satu tinjauan |

---

## Ringkasan pelajaran

| Pelajaran | Siapa yang menunjukkannya | Kapan |
| --- | --- | --- |
| Tulis risiko dengan tanda dan rencana B sebelum mulai | Ayu | Jumat 19.12 |
| Ukur patokan sebelum kondisi menyala | Ayu | Jumat 19.15, Sabtu 07.31 |
| Laptop jenuh adalah temuan tentang alat ukur; turunkan laju dan tulis alasannya | Ayu | Jumat 19.32, Sabtu 07.35 |
| Dugaan yang gugur tetap ditulis | Ayu | Jumat 19.42 |
| Satuan yang berbeda bisa terlihat seperti angka yang bertentangan | Bimo | Jumat 19.43 |
| Peninjau kedua memeriksa hal yang belum disentuh peninjau pertama | Citra | Jumat 19.43, Sabtu 07.59 |
| Prediksi ditulis sebelum mengukur | Ayu | Sabtu 07.31 |
| Usul di tiket dinilai terhadap dokumen konteks, bukan pendapat | Ayu | Sabtu 07.31 sampai 07.47 |
| Informasi samping (200 x 200 dari Rudi) bisa menjadi kunci perbaikan | Rudi, Ayu | 13 Nov, Sabtu 07.47 |
| Prediksi yang terasa pasti tetap diuji, dengan cakupan penuh | Ayu | Sabtu 07.41 sampai 07.47 |
| Test patokan ditulis sebelum kode diubah | Ayu | Sabtu 07.48 |
| Bandingkan dengan patokan dari hari yang sama; batasi klaim | Ayu, Citra | Sabtu 07.53 sampai 07.59 |
| Hal yang belum terjelaskan masuk tindak lanjut, tidak hilang di jurnal | Bimo | Sabtu 07.59 |
| Ubah rencana secara terbuka saat terjadi | Ayu | Sabtu 07.47 |
