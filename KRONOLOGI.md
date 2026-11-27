# Kronologi tiket #4821, PK-200, dan PK-300

Dokumen ini menceritakan, menurut urutan waktu, bagaimana satu masalah kinerja ditemukan, didiagnosis, dan diperbaiki
di aplikasi PasarKita. Dokumen ini mencatat siapa melakukan apa, apa yang mereka pikirkan dan pertimbangkan, dan apa yang
mereka pelajari. Pembaca bisa memahaminya tanpa membuka berkas lain.

## Ringkasan

**Aplikasinya.** PasarKita adalah layanan toko daring (Spring Boot dan PostgreSQL). Salah
satu halamannya adalah **profil toko** (`GET /api/sellers/{id}/profile`). Halaman ini menampilkan data toko dan sampai 60
produknya; setiap produk punya alamat gambar kecil (**thumbnail**).

**Masalahnya.** Suatu hari para penjual mengeluh bahwa profil toko butuh beberapa detik untuk dibuka, padahal kemarin
masih cepat. Toko dengan produk terbanyak mengalami keterlambatan paling parah.

**Penyebabnya.** Tim Product baru saja menyalakan fitur **thumbnail dinamis** lewat flag `seller.dynamic-thumbnail`. Untuk
setiap produk, kode aplikasi membuat gambar besar 1600 x 1600 piksel, mengecilkannya, lalu hanya membaca **satu piksel**
untuk menyusun alamat thumbnail. Untuk 60 produk, pekerjaan itu memakan sekitar 1 detik CPU per request. Database tidak
terlibat.

**Kenapa masalah ini tidak bisa diperbaiki sembarangan.** Tiga dokumen menutup jalan pintas:
- Tim Product memutuskan bahwa fitur ini **tetap menyala**, karena klik produk naik 9%.
- Alamat thumbnail **tidak boleh berubah**. Bila alamatnya berubah, CDN (layanan penyimpan gambar) akan membuat ulang semua
  gambar, dan biayanya naik.
- Tim Platform **tidak punya anggaran** untuk server tambahan.

**Perbaikannya.** Ayu, pemilik tiket, mengubah kode supaya aplikasi membuat gambar langsung berukuran 200 x 200 piksel,
yaitu ukuran yang memang ditampilkan di layar. Ayu hanya mengubah satu berkas kode. Sebuah test membuktikan bahwa alamat
thumbnail tetap sama untuk **semua** 255 kemungkinan warna.

**Hasilnya.** Ayu mengukur dengan beban 2 request per detik, flag tetap menyala, di komputer uji yang sama:

| | Flag mati (patokan) | Sebelum perbaikan | Sesudah perbaikan |
| --- | --- | --- | --- |
| Waktu respons toko terbesar (p95) | 22 ms | sekitar 57 detik, 40,7% request gagal | **39 ms**, 0 gagal |
| Pemakaian CPU aplikasi (per core; 4 thread = 400%) | | 137 sampai 299% | 0,8 sampai 9,3% |
| Isi respons | | | Sama persis dengan sebelum perbaikan |

**Pelajaran terbesarnya.** Ayu hampir menolak perbaikan terbaik karena ia yakin gambar kecil akan mengubah alamat
thumbnail. Ayu mengujinya dulu, dan dugaannya ternyata salah.

## Istilah

| Istilah | Arti |
| --- | --- |
| Tiket | Laporan masalah. Tiket **#4821** meminta diagnosis saja; tiket **PK-200** meminta perbaikan |
| Paket konteks | Dokumen pendukung tiket (keputusan produk, percakapan tim, anggaran) yang berisi batasan |
| Flag | Pengaturan untuk menyalakan atau mematikan sebuah fitur tanpa merilis kode baru. Di cerita ini: `seller.dynamic-thumbnail` |
| Komputer uji | Laptop Intel Core i5-5250U (2 core, 4 thread), RAM 8 GB, macOS 12, tanpa Docker. Semua pengukuran memakai komputer ini dan data skala S (200 penjual) |
| p50, p95 | Waktu respons yang tidak dilampaui oleh 50% dan 95% request. Angka p95 menggambarkan pengalaman pengguna yang paling lambat |
| req/detik | Jumlah request per detik, yaitu beban yang dikirim alat uji **k6** |
| Patokan | Hasil ukur saat flag mati, sebagai pembanding |
| Issue, PR | Halaman GitHub. Issue mencatat tiket dan diskusinya; PR (pull request) berisi perubahan yang ditinjau sebelum digabung |
| Repo induk | Repo PasarKita, sumber kode dan tiket. Tim mengambil pembaruannya lewat PR (`git fetch templat`) |
| Commit | Satu simpanan perubahan di Git, dikenali dengan kode pendek seperti `0f51d95` |
| WIB, UTC | Zona waktu. WIB = UTC + 7 jam. Grafik pemantauan (Grafana) memakai UTC |

## Siapa saja

| Siapa | Peran | Di cerita ini |
| --- | --- | --- |
| Ayu | Pemilik tiket, anggota tim backend | Ayu mengukur, mendiagnosis, dan memperbaiki |
| Bimo | Peninjau 1, anggota tim backend | Bimo meninjau laporan dan perbaikan |
| Citra | Peninjau 2, anggota tim backend | Citra meninjau hal yang tidak diperiksa Bimo |
| Tim Dukungan Penjual | Pelapor tiket #4821 | Tim ini meneruskan keluhan penjual |
| Maya | Account Manager | Maya melapor di tiket PK-200 |
| Eko | Senior Developer | Eko mengusulkan "matikan saja flag-nya" |
| Dimas | QA (penguji) | Dimas mengusulkan "tambah server" |
| Bayu | Product | Bayu memutuskan flag tetap menyala |
| Rudi | Front-end | Rudi menjelaskan cara kerja CDN dan ukuran gambar di layar |
| Tomi | Pemantauan | Tomi mengingatkan lonjakan biaya CDN sebelumnya |
| Tim Platform | Pengelola anggaran infrastruktur | Tim ini menyusun anggaran tanpa server tambahan |
| Lestari | Tim Keuangan | Lestari melapor di tiket PK-300 |
| Yoga | Tim Integrasi Pajak | Yoga menjelaskan arti tarif `null` |
| Pak Hendra | Senior Developer | Pak Hendra mengusulkan "pakai saja 11%" di PK-300 |

## Apa yang nyata dan apa yang ilustrasi

- **Untuk siapa:** dokumen ini teladan praktik kerja bagi mahasiswa yang mengerjakan tiket di repo PasarKita.
- **Nyata:** semua tindakan, jam, angka, kode, Issue, PR, dan commit. Setiap langkah menyebut sumbernya, dan pembaca bisa
  memeriksanya di repo ini.
- **Teks asli:** dokumen ini mengutip isi tiket dan paket konteks secara utuh di titik waktunya.
- **Ayu, Bimo, Citra:** satu akun GitHub memainkan ketiga peran ini. Pikiran mereka di dokumen ini disusun dari apa yang
  mereka tulis sendiri di Issue, PR, dan jurnal. Komentar tinjauan mereka hanya berjarak beberapa detik karena satu akun
  mengirimnya berurutan; di tim sungguhan, peninjau butuh waktu.
- **Tokoh lain** (Maya, Eko, Dimas, Bayu, Rudi, Tomi, Tim Platform, Tim Dukungan Penjual, Lestari, Yoga, Pak Hendra) hanya muncul di teks tiket dan
  paket konteks. Pesan mereka diambil apa adanya dari teks itu. Apa yang mereka pikirkan, pertimbangkan, dan pelajari
  adalah **ilustrasi**: penulis menambahkannya untuk membantu pembaca memahami sudut pandang mereka. Ilustrasi itu masuk
  akal, tidak bertentangan dengan fakta, dan ditandai *(ilustrasi)*.

## Daftar isi

1. [Sebelum tiket ada](#bagian-a-sebelum-tiket-ada): anggaran, keputusan produk, percakapan CDN
2. [Jumat 20 November: diagnosis #4821](#bagian-b-jumat-20-november-2026-diagnosis-4821)
3. [Sabtu 21 November: perbaikan PK-200](#bagian-c-sabtu-21-november-2026-perbaikan-pk-200)
4. [Sesudah tiket ditutup](#bagian-d-sesudah-penutupan-ilustrasi)
5. [Jumat 27 November: perbaikan PK-300](#bagian-e-jumat-27-november-2026-perbaikan-pk-300)
6. [Ringkasan pelajaran](#ringkasan-pelajaran)

Semua jam dalam **WIB**, kecuali ditandai UTC.

---

## Bagian A. Sebelum tiket ada

Tiga dokumen ini sudah ada sebelum siapa pun membuka tiket. Ketiganya nanti menentukan perbaikan mana yang boleh dipakai.

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

- **Dilakukan.** Tim Platform menetapkan bahwa server aplikasi tetap 8 instance tanpa anggaran tambahan. Penambahan di
  luar anggaran butuh persetujuan Komite Arsitektur, yang bersidang sebulan sekali. Kenaikan lalu lintas server gambar
  ditagihkan sebagai biaya tambahan.
- **Dipikirkan** *(ilustrasi)*. Tim Platform ingat bahwa kuartal lalu tagihan cloud melonjak karena tim-tim menambah server
  setiap kali ada keluhan lambat, lalu tidak pernah menguranginya. Tim Platform ingin biaya bisa diramalkan, jadi mereka
  sengaja membuat jalan pintas "tambah mesin" berjalan lambat.
- **Dipertimbangkan** *(ilustrasi)*. Tim Platform menilai larangan total terlalu kaku untuk keadaan darurat. Mereka memilih
  jalan tengah, yaitu Komite Arsitektur: penambahan server tetap mungkin, tetapi pemohon harus menjelaskan mengapa kodenya
  tidak bisa diperbaiki lebih dulu.
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

- **Dilakukan.** Bayu dan Tim Desain memutuskan tiga hal: flag `seller.dynamic-thumbnail` tetap menyala; flag hanya boleh
  dimatikan dalam keadaan darurat, dengan persetujuan Product, dan harus dicatat sebagai insiden; format URL thumbnail
  tidak boleh berubah.
- **Dipertimbangkan.** Bayu berpegang pada hasil uji A/B dua minggu: klik produk dari profil toko naik 9%.
- **Dipikirkan** *(ilustrasi)*. Bayu pernah melihat fitur bagus dimatikan "sementara" saat ada keluhan, lalu tidak pernah
  dinyalakan lagi. Karena itu Bayu sengaja membuat prosedur mematikan flag menjadi mahal: perlu persetujuan Product dan
  dicatat sebagai insiden. Bayu tidak menulis apa pun soal kecepatan, karena uji A/B berjalan dengan lalu lintas kecil dan
  tidak ada yang mengeluh.
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

| Jam | Siapa | Isi pesan | Dipikirkan *(ilustrasi)* |
| --- | --- | --- | --- |
| 09.15 | Rudi | CDN menyimpan gambar berdasarkan URL persis; bila kode warna berubah, CDN membuat ulang semua gambar | Rudi ingin mencegah perubahan kecil di backend menjadi masalah besar di CDN |
| 09.22 | Tomi | Terakhir kali, lalu lintas server gambar naik delapan kali selama dua hari | Tomi pernah mengalaminya dan tidak mau kejadian itu terulang |
| 09.30 | Bayu | URL thumbnail dianggap kontrak dengan CDN dan aplikasi mobile | Bayu mengubah kebiasaan menjadi aturan tertulis |
| 09.41 | Rudi | Profil menampilkan 200 x 200; gambar 1600 x 1600 hanya untuk zoom di detail produk | Rudi heran mengapa backend repot membuat gambar sebesar itu, tetapi tidak ada yang membalas pesannya. Informasi samping ini ternyata menjadi kunci perbaikan |

- **Sumber.** `labs/pk-200/konteks/02-thread-cdn.md`

---

## Bagian B. Jumat 20 November 2026: diagnosis #4821

### 19.10 sampai 19.13: Ayu menyiapkan kerja sebelum mengukur

- **Dilakukan.** Ayu membuat repo kerja dari repo induk PasarKita (19.10). Ayu menulis rencana sesi di Issue #1 dan menulis ulang tiket
  #4821 dengan kata-katanya sendiri di Issue #2 (19.12). Ayu membuka PR #3 sebagai draf dan memulai laporan dari format
  laporan baku tim (19.13).
- **Dipikirkan.** Ayu menilai risiko terbesarnya bukan kode, melainkan tiga hal: komputer uji bisa kewalahan saat flag
  menyala, beban latar (`task traffic`) bisa mencampuri angka k6, dan pembaruan repo induk untuk PK-200 belum tersedia.
- **Dipertimbangkan.** Untuk setiap risiko, Ayu menulis **tanda** yang bisa diamati dan **rencana B**. Bila k6 mencatat
  request gagal, Ayu menurunkan beban ke `RATE=1`. Ayu memakai beban latar hanya untuk grafik dan menghentikannya sebelum
  k6. Bila folder tiket PK-200 belum ada, Ayu membaca jurnal dan kode lebih dulu.
- **Dugaan awal.** Di Issue #2, Ayu menulis dua dugaan yang ditandai belum terbukti: query produk untuk toko besar lambat,
  atau ada perubahan konfigurasi.
- **Sumber.** Issue #1, Issue #2, PR #3, commit `c9a2714`, `df59a69`

### 19.14 sampai 19.18: Ayu mengukur patokan sebelum flag menyala

- **Dilakukan.** Ayu menyalakan aplikasi pukul 19.14.56. Pukul 19.15.15 Ayu menjalankan k6 dengan flag mati: p50 11,4 ms,
  p95 18,8 ms, 0 dari 361 request gagal.
- **Dipikirkan.** Ayu tahu bahwa tanpa angka "normal", kata "lambat" tidak bisa dibuktikan.
- **Sumber.** `labs/latihan/LAPORAN-4821.md` bukti 1

### 19.18.58: flag dinyalakan (`task latihan:mulai`)

- **Dilakukan.** Ayu menjalankan `task latihan:mulai`, yang menyalakan flag untuk mereproduksi keadaan saat tiket
  dilaporkan. Ayu mencatat
  jamnya dalam WIB dan UTC (12.18.58 UTC), lalu menjalankan beban latar (`task traffic`) untuk grafik.
- **Dipikirkan.** Ayu tahu bahwa Grafana memakai UTC. Dengan mencatat jam di dua zona, Ayu tidak salah membaca grafik.

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

- **Isi laporan.** Tim Dukungan Penjual melaporkan bahwa beberapa penjual mengeluh profil toko butuh beberapa detik,
  padahal kemarin masih cepat, dan bahwa toko dengan produk banyak paling sering mengeluh.
- **Dipikirkan** *(ilustrasi)*. Petugas dukungan menerima tiga keluhan serupa dalam satu jam dan sempat ragu apakah ini
  masalah jaringan penjual. Petugas itu mencoba sendiri membuka profil toko besar dan toko kecil, dan toko besar terasa
  jauh lebih lama. Petugas itu menulis apa yang dirasakan penjual, bukan penyebabnya, karena ia tidak tahu penyebabnya.
- **Dipertimbangkan** *(ilustrasi)*. Petugas itu menimbang prioritas "tinggi" atau "sedang", lalu memilih "sedang" karena
  halaman lain normal dan pembeli masih bisa berbelanja.
- **Sumber.** `labs/latihan/TIKET.md`

### 19.31 sampai 19.38: Ayu mengukur gejala, dan komputer uji kewalahan

- **Dilakukan.** Ayu menghentikan beban latar pukul 19.31, **sebelum** menjalankan k6. Pada 2 req/detik (19.32), 12,5%
  request gagal dan p95 mencapai 40 detik. Pada 1 req/detik (19.37), tidak ada request yang gagal: p50 613 ms, p95 1,67
  detik.
- **Dipikirkan.** Ayu menyadari bahwa angka pada 2 req/detik mengukur antrean di komputer uji yang hanya punya 2 core,
  bukan kecepatan halaman profil. Rencana B (`RATE=1`) yang Ayu tulis pukul 19.12 pun berlaku.
- **Dipertimbangkan.** Ayu menimbang apakah angka 2 req/detik dibuang atau disimpan. Ayu memutuskan menyimpannya sebagai
  bukti 2, memberinya tanda "mengukur antrean", dan tidak memakainya sebagai ukuran gejala.
- **Sumber.** Laporan #4821 bukti 2 dan 3

### Sesudah 19.38: Ayu mencari di mana waktunya habis

- **Dilakukan.** Ayu mengumpulkan bukti dari lima sumber:
  - `curl` 10 request: penjual 1 (60 produk) 1.403 ms; penjual 2 dan 77 (25 produk) 665 dan 592 ms.
  - `pg_stat_statements`: 2 query per request, keduanya di bawah 1 ms.
  - `ps`: CPU aplikasi sampai 339,5%.
  - Tabel `feature_flag`: `seller.dynamic-thumbnail = t` (menyala).
  - Kode: `ThumbnailService` membuat gambar 1600 x 1600 untuk setiap produk hanya untuk membaca satu piksel.
- **Dipelajari.** Ayu menyimpulkan bahwa dugaan "query produk lambat" **gugur**. Waktu respons sebanding dengan jumlah
  produk (60/25 = 2,4; 1.403 ms dibagi rata-rata 628 ms = 2,2), jadi biayanya terjadi per produk, di CPU aplikasi.
- **Dipertimbangkan.** Ayu melihat peringatan `legacy.timeout` di log. Ayu mengabaikannya karena peringatan itu sudah muncul
  54 baris tiap 30 detik **sejak sebelum** flag menyala. Ayu menulis keputusan itu beserta alasannya di bagian "Yang
  diabaikan".
- **Sumber.** Laporan #4821 bukti 6 sampai 10, bagian "Yang diabaikan"

### 19.42: Ayu menulis laporan dan komentar progres

- **Dilakukan.** Ayu meng-commit laporan (`9ba1d88`) yang berisi gejala, cara mereproduksi, sepuluh bukti, dua hipotesis
  bertanda "belum terbukti", dan keterbatasan. Ayu juga menulis komentar progres di Issue #2.
- **Dipikirkan.** Ayu belum menguji hipotesisnya secara langsung, jadi Ayu tidak menulisnya sebagai akar masalah yang pasti.
  Ayu memasukkan cara mengujinya ke "Langkah berikutnya": mematikan flag lalu mengukur, dan mengukur `thumbnailFor`
  sendiri.
- **Sumber.** Commit `9ba1d88`, Issue #2

### 19.43 sampai 19.44: Bimo dan Citra meninjau PR #3

| Jam | Siapa | Dilakukan | Dipikirkan |
| --- | --- | --- | --- |
| 19.43.24 | Bimo | Bimo meminta satu perubahan | Bimo melihat Prometheus menulis CPU 35%, sedangkan `ps` menulis 339%. Pembaca bisa menyimpulkan CPU "hanya 35%" bila satuannya tidak ditulis |
| 19.43 | Ayu | Ayu menulis satuan di bukti 5 dan 6 (commit `ea3fe4a`), lalu membalas | Ayu menjelaskan bahwa satuannya berbeda, bukan angkanya yang bertentangan: Prometheus menghitung seluruh mesin = 100%, `ps` menghitung per core = 400% |
| 19.43.57 | Citra | Citra menyetujui | Citra memeriksa hal yang belum disentuh Bimo, yaitu jam: 19.18.58 WIB = 12.18.58 UTC, dan titik 12.20 di grafik mewakili jendela 12.19 sampai 12.20 |
| 19.43.59 | Bimo | Bimo menyetujui | Bimo membaca ulang tabel bukti dan tidak menemukan pertentangan lagi |
| 19.44.03 | Ayu | Ayu menggabungkan PR #3, dan Issue #2 tertutup | |

- **Dipelajari.** Ayu, Bimo, dan Citra melihat bahwa dua peninjau berguna bila mereka memeriksa hal yang berbeda dan
  menyebut apa yang mereka periksa.
- **Sumber.** Komentar PR #3, commit `ea3fe4a`

### 19.44: Ayu menutup #4821 dan mencatat titik cek

- **Dilakukan.** Ayu menulis komentar penutupan di Issue #2 (akar masalah sebagai hipotesis kuat, tabel sinyal, dan tindak
  lanjut ke PK-200) dan komentar **Cek 19.44** di Issue #1.
- **Hambatan yang dicatat.** Ayu mencatat bahwa pembaruan repo induk (`labs/pk-200`) belum tersedia, sehingga rencana B
  ketiga berlaku.
- **Sumber.** Issue #2, Issue #1

### 19.45 Jumat sampai 07.30 Sabtu: jeda

Ayu tidak bekerja selama jeda ini karena menunggu pembaruan repo induk. Ayu nanti mencatat jeda ini secara terbuka di komentar
**Perubahan**.

---

## Bagian C. Sabtu 21 November 2026: perbaikan PK-200

### 07.30: Ayu mengambil pembaruan repo induk (PR #4)

- **Dilakukan.** Ayu mengikuti `docs/PANDUAN-PEMBARUAN.md`: Ayu mengambil pembaruan lewat cabang baru dan PR.
- **Dipikirkan.** Ayu menjaga agar pembaruan tidak menimpa pekerjaan tim.
- **Diperiksa Bimo.** Bimo memastikan bahwa 9 berkas yang berubah semuanya ada di `labs/` dan `docs/`, berkas alat tidak
  berubah, dan `LAPORAN-4821.md` serta `group.env` tidak tersentuh. Bimo menyetujui.
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
> - p95 `GET /api/sellers/{id}/profile` pada 2 req/detik dengan flag `seller.dynamic-thumbnail` menyala tidak lebih dari dua kali p95 saat flag mati, diukur di komputer yang sama.
> - Tidak ada request yang gagal pada 2 req/detik.
> - Respons profil tidak berubah selama flag menyala.

Pesan di dalam tiket (di dalam cerita, hari Senin):

| Jam | Siapa | Isi pesan | Dipikirkan *(ilustrasi)* | Bagaimana Ayu menilainya |
| --- | --- | --- | --- | --- |
| 10.05 | Maya | Toko Raksasa dan toko lain mengeluh; diagnosis sudah ada di #4821 | Toko Raksasa adalah penjual terbesar yang Maya pegang, dan pemiliknya sudah menelepon dua kali. Maya tidak paham teknisnya, jadi Maya menautkan #4821 supaya developer tidak mulai dari nol | Ayu menganggapnya konteks yang menyambung ke Issue #2 |
| 10.20 | Eko | Matikan saja flag thumbnail-nya | Eko membaca #4821, melihat flag menyala tepat sebelum halaman melambat, dan menyimpulkan flag itu biang masalahnya. Eko tidak tahu keputusan produk 12 November karena tidak ikut rapatnya | Ayu menganggapnya solusi titipan dan memeriksanya terhadap paket konteks |
| 10.40 | Dimas | Atau tambah server aplikasi | Di uji beban QA, Dimas biasa melihat p95 turun bila instance ditambah. Dimas mengira masalahnya kapasitas, bukan biaya per request | Ayu menganggapnya solusi titipan dan memeriksanya terhadap paket konteks |

- **Dilakukan.** Ayu membuka Issue #5 dan PR #6. Ayu menulis tiga prediksi di `JURNAL.md` **sebelum** mengukur apa pun
  (commit `d44210e`):
  1. Waktu habis di `thumbnailFor`, sekitar 1 detik untuk 60 produk.
  2. Mematikan flag akan memulihkan kecepatan, tetapi mengubah isi respons.
  3. Membuat gambar langsung kecil akan **mengubah URL**, jadi cara itu tidak boleh dipakai.
- **Dipikirkan.** Ayu menulis prediksi lebih dulu supaya hasil pengukuran bisa membuktikan prediksinya salah, bukan
  sebaliknya Ayu menyesuaikan prediksi dengan hasil.
- **Sumber.** Issue #5, `labs/pk-200/JURNAL.md` bagian 1

### 07.31 sampai 07.47: Ayu membaca paket konteks dan mengukur

- **Dilakukan, membaca.** Ayu menyusun daftar asumsi di jurnal: flag tetap menyala (batasan keras), URL tidak boleh berubah
  (keras), tidak ada anggaran server (keras), alasan biaya CDN (konteks), dan profil hanya menampilkan 200 x 200 (konteks).
- **Dipikirkan.** Ayu memperhatikan bahwa dua usul di tiket datang sebelum siapa pun menyebut penyebabnya. Ayu menolak
  keduanya berdasarkan **dokumen konteks**, bukan pendapatnya sendiri: usul Eko melanggar keputusan Bayu, dan usul Dimas
  melanggar anggaran. Selain itu, server tambahan tidak membuat **satu** request lebih cepat dari 1 detik.
- **Dilakukan, mengukur.** Ayu menjalankan pengukuran berikut:

| Jam | Yang diukur Ayu | Hasil |
| --- | --- | --- |
| 07.31 | Flag mati, 2 req/detik (patokan) | Penjual 1 p95 22 ms, penjual lain 23 ms, 0 gagal |
| 07.35.36 | `task latihan:mulai` | Flag menyala |
| 07.35 | Flag menyala, 2 req/detik | 40,7% dan 35,9% request gagal; CPU 137 sampai 299% per core |
| 07.41 | Flag menyala, 1 req/detik | Penjual 1 p50 1.741 ms; `curl` 2.373 ms |
| sesudahnya | Respons JSON saat flag mati vs menyala | `thumbnail` berbeda di 60, 25, dan 25 produk: prediksi 2 **benar** |
| sesudahnya | `BandingThumbnail.java`, 255 warna | 60 thumbnail butuh 934 ms dengan cara lama vs 16 ms dengan cara langsung kecil: prediksi 1 **benar**. URL berbeda 0 dari 255: prediksi 3 **salah** |

- **Dipelajari.** Ayu belajar bahwa prediksi 3 terasa pasti, tetapi salah. Warna thumbnail hanya bergantung pada
  `productId * 37 % 255`. Karena 37 dan 255 tidak punya faktor bersama, produk 1 sampai 255 mencakup **semua** kemungkinan
  warna, jadi uji Ayu lengkap, bukan sampel.
- **Juga dicatat, belum terjelaskan.** Ayu mencatat bahwa run Sabtu lebih lambat daripada run Jumat untuk kondisi yang sama
  (2.373 vs 1.403 ms).
- **Sumber.** `JURNAL.md` bagian 2 sampai 4, `labs/pk-200/BandingThumbnail.java`, commit `2489551`

### 07.47: Ayu membandingkan alternatif dan memilih

| Alternatif | Pertimbangan Ayu | Keputusan Ayu |
| --- | --- | --- |
| A. Matikan flag (usul Eko) | Melanggar keputusan produk; URL di respons berubah | Ditolak |
| B. Tambah server (usul Dimas) | Melanggar anggaran; satu request tetap lebih dari 1 detik | Ditolak |
| C. Simpan hasil per produk | Memenuhi batasan, tetapi hanya menutupi biaya; request pertama tetap lambat; memori bertambah | Disimpan sebagai cadangan |
| D. Buat gambar langsung 200 x 200 | Menghapus pekerjaan 1600 x 1600; URL sama untuk 255 dari 255 warna | **Dipilih** |

- **Dipikirkan.** Ayu menyadari bahwa sebelum uji 255 warna, ia hampir menolak alternatif D karena prediksi 3. Tanpa uji
  itu, Ayu akan memilih C.
- **Dilakukan juga.** Ayu menulis komentar **Perubahan 07.47** di Issue #1. Komentar itu mencatat apa yang berubah (sesi
  terbelah semalam), pemicunya (pembaruan repo induk terlambat), dan apa yang dikorbankan (tidak ada tiket yang dibatalkan,
  tetapi angka Jumat dan Sabtu harus dibandingkan dengan hati-hati).
- **Sumber.** `JURNAL.md` bagian Alternatif, Issue #1

### 07.48 sampai 07.49: Ayu menulis test dulu, baru mengubah kode

| Jam | Commit | Dilakukan | Dipikirkan |
| --- | --- | --- | --- |
| 07.48 | `48cab1c` | Ayu menambah `ThumbnailServiceTest`, yang membandingkan layanan dengan salinan cara lama untuk 255 warna dan tiga id besar. Test ini lulus pada kode lama | Ayu tahu bahwa test yang lulus pada kode lama membuktikan test itu menjaga perilaku lama, bukan dibuat menyesuaikan kode baru |
| 07.49 | `0f51d95` | Ayu mengubah `ThumbnailService` supaya membuat gambar langsung 200 x 200. Test yang sama tetap lulus | Ayu hanya mengubah satu berkas, sehingga perubahan ini mudah dibatalkan |

- **Sumber.** Commit `48cab1c`, `0f51d95`, `src/test/java/id/pasarkita/catalog/ThumbnailServiceTest.java`

### 07.50 sampai 07.57: Ayu mengukur ulang dengan flag tetap menyala

- **Dilakukan.** Ayu menjalankan ulang aplikasi dari cabang `pk-200`, lalu:
  - mengukur pada 1 req/detik (07.50): penjual 1 p95 52 ms;
  - mengukur pada 2 req/detik (07.53): penjual 1 p95 **39 ms**, penjual lain 25 ms, 0 gagal; CPU 0,8 sampai 9,3%;
  - membandingkan respons JSON penjual 1, 2, dan 77 sebelum dan sesudah perbaikan dengan `cmp`: **sama persis**;
  - menjalankan `task evidence LAB=pk-200` (07.57) dari commit `0f51d95` tanpa perubahan yang belum di-commit, lalu
    melampirkan berkas buktinya di PR tanpa meng-commit-nya.
- **Dipertimbangkan.** Ayu tahu bahwa target "≤ 2 x patokan" hanya sah bila patokan dan hasil diukur pada hari yang sama di
  komputer uji yang sama. Karena itu Ayu memakai patokan Sabtu 07.31, bukan angka Jumat: 39 ≤ 44 ms dan 25 ≤ 46 ms.
- **Sumber.** `JURNAL.md` bagian Perbaikan, komentar bukti di PR #6, commit `83ec219`, `1a05fc0`

### 07.58 sampai 07.59: Bimo dan Citra meninjau PR #6

| Jam | Siapa | Yang diperiksa | Dipikirkan dan diputuskan |
| --- | --- | --- | --- |
| 07.59.05 | Bimo | Bimo memeriksa pemanggil `thumbnailFor` (hanya satu), hasil test (lulus 2 dari 2), urutan commit (test lebih dulu, lalu kode), asal bukti (`0f51d95`), dan sumber batasan | Bimo meminta Ayu memindahkan catatan selisih Jumat-Sabtu dari jurnal ke tindak lanjut penutupan, supaya tidak hilang |
| 07.59.07 | Ayu | | Ayu setuju. Ayu menjelaskan bahwa selisih itu tidak memengaruhi kesimpulan karena target dibandingkan pada hari yang sama |
| 07.59.08 | Citra | Citra memeriksa perhitungan 2 x patokan, klaim di PR, hasil `cmp`, dan test 255 warna | Citra menilai klaim PR sudah dibatasi dengan benar: penjual 1 masih 17 ms di atas patokan karena 60 thumbnail tetap dibuat. Citra menyetujui |
| 07.59.10 | Bimo | Bimo membaca jawaban Ayu | Bimo menyetujui |
| 07.59.28 | Ayu | Ayu menggabungkan PR #6 | |

- **Sumber.** Komentar PR #6

### 07.59: Ayu menutup PK-200 dan menulis refleksi sesi

- **Dilakukan.** Ayu menulis komentar penutupan Issue #5. Komentar itu memuat akar masalah, sinyal di tiket dan statusnya,
  batasan beserta berkas sumbernya, alternatif, hasil, bukti, dan empat tindak lanjut: selisih Jumat-Sabtu, sisa 17 ms,
  belum diukur di skala M, dan tabel `feature_flag` yang tidak menyimpan waktu perubahan. Setelah itu Ayu menulis
  **Refleksi** dan menutup Issue #1.
- **Dipelajari (dari refleksi Ayu).**
  - Ayu menemukan bahwa yang paling meleset bukan perkiraan ukuran tiket, tetapi ketergantungan pada pembaruan repo induk.
  - Ayu menilai langkah paling berguna adalah menguji prediksi 3 sebelum memilih perbaikan.
  - Ke depan, Ayu akan menulis "folder lab belum ada setelah `git fetch templat`" sebagai risiko tersendiri di setiap
    rencana.
- **Sumber.** Issue #5, Issue #1

### Yang didapat pemangku kepentingan lain dari penutupan

| Siapa | Kekhawatirannya (dari pesannya) | Jawaban di komentar penutupan |
| --- | --- | --- |
| Maya, Tim Dukungan Penjual | Profil toko lambat | p95 penjual 1 turun dari sekitar 57 detik menjadi 39 ms pada 2 req/detik |
| Eko | Gejala cepat hilang | Gejala hilang tanpa mematikan flag; Ayu menolak usul Eko dengan alasan dari keputusan produk |
| Dimas | Kapasitas | Tanpa server tambahan, CPU turun dari 137-299% menjadi 0,8-9,3% |
| Bayu | Flag tetap menyala | Flag menyala selama semua pengukuran sesudah perbaikan |
| Rudi, Tomi | URL tidak berubah, sehingga CDN tidak membuat ulang gambar | Test 255 warna dan `cmp` 3 penjual membuktikan URL sama persis |
| Tim Platform | Anggaran | Perbaikan hanya mengubah kode, satu berkas |

---

## Bagian D. Sesudah penutupan (ilustrasi)

Seluruh bagian ini ilustrasi: peristiwanya tidak ada di Issue atau PR, tetapi setiap angka yang disebut berasal dari
catatan nyata di atas.

| Siapa | Yang dilakukan | Yang dipikirkan | Yang dipelajari |
| --- | --- | --- | --- |
| Maya | Maya mengabari pemilik Toko Raksasa bahwa profil sudah cepat lagi dan fitur thumbnail tetap ada | Maya lega bisa menjawab "sudah beres" dengan angka, bukan janji | Maya belajar bahwa menautkan tiket diagnosis (#4821) menghemat waktu, karena developer tidak mulai dari nol |
| Eko | Eko membaca komentar penutupan Issue #5 | Eko menyadari bahwa usulnya memang akan menghentikan gejala, tetapi juga mengubah `thumbnail` di 60 produk penjual 1 dan memicu CDN membuat ulang gambar | Eko belajar bahwa gejala yang hilang belum tentu berarti masalah selesai; sebelum mengusulkan, ia perlu memeriksa keputusan dan kontrak yang berlaku |
| Dimas | Dimas menambahkan skenario "satu request ke toko besar" ke daftar uji QA | Dimas melihat bahwa pada 1 req/detik pun satu request penjual 1 butuh lebih dari 1 detik, dan server tambahan tidak bisa mempercepat satu request | Dimas belajar membedakan biaya per request dari kapasitas, dan mengukur satu request sebelum menambah mesin |
| Bayu | Bayu menambahkan syarat untuk fitur berikutnya: uji A/B juga harus mencatat waktu respons | Bayu menyadari bahwa uji A/B dua minggu membuktikan klik naik 9%, tetapi tidak ada yang mengukur kecepatannya | Bayu belajar bahwa keputusan produk perlu ukuran kinerja, bukan hanya ukuran bisnis |
| Rudi | Rudi membalas thread #infra-cdn bahwa URL tidak berubah dan sudah dibuktikan dengan test 255 warna | Rudi melihat bahwa komentarnya soal 200 x 200, yang dulu tidak dibalas siapa pun, menjadi dasar perbaikan | Rudi belajar bahwa informasi tentang cara data dipakai di layar layak ditulis, walau terlihat sepele |
| Tomi | Tomi memantau lalu lintas server gambar selama dua hari sesudah perbaikan dirilis | Tomi khawatir kejadian "naik delapan kali" terulang, tetapi grafiknya ternyata datar | Tomi belajar bahwa test yang membandingkan URL lama dan baru lebih menenangkan daripada janji |
| Tim Platform | Tim Platform mencatat kasus ini sebagai contoh di panduan permintaan server | Tim Platform menilai bahwa permintaan server tambahan untuk kasus seperti ini akan ditolak Komite, karena penyebabnya biaya per request | Tim Platform melihat bahwa anggaran yang ketat mendorong orang mencari akar masalah |
| Ayu | Ayu menulis risiko "folder lab belum ada" di rencana sesi berikutnya | Ayu teringat bahwa ia hampir memilih cache karena prediksi 3 | Ayu belajar bahwa prediksi yang terasa pasti justru paling perlu diuji |
| Bimo | Bimo menambahkan "satuannya sama?" ke daftar periksa tinjauannya | Bimo sadar bahwa ia dua kali menangkap hal yang hampir hilang: satuan CPU, lalu selisih Jumat-Sabtu | Bimo belajar bahwa tugas peninjau juga menjaga hal yang belum terjelaskan supaya tidak hilang |
| Citra | Citra membagi tugas tinjauan dengan Bimo sejak awal di PR berikutnya | Citra melihat bahwa tinjauannya berguna justru karena ia memeriksa hal yang tidak diperiksa Bimo | Citra belajar bahwa dua peninjau yang memeriksa hal yang sama hanya memberi satu tinjauan |

---

## Bagian E. Jumat 27 November 2026: perbaikan PK-300

PK-300 adalah tiket contoh minggu 27 November – 3 Desember. Gejalanya bukan lambat, melainkan **data yang salah**: pesanan
tersimpan tanpa pajak. Pemiliknya tetap Ayu, peninjaunya Bimo dan Citra.

**Ringkasnya:** sejak 1 November, layanan pajak membalas tarif `null` untuk kategori produk baru yang tarifnya belum
ditetapkan, dan kode aplikasi mengubahnya menjadi tarif 0 tanpa error. Ayu menulis test yang gagal pada kode lama, lalu
mengubah kode supaya checkout produk itu ditolak dengan kode 422 dan pesan yang jelas. Pesanan berpajak Rp0 turun dari
sekitar 70 per run menjadi 0, waktu checkout produk bertarif tidak memburuk (p95 369 lalu 355 ms), dan 448 pesanan lama
yang terdampak ditemukan dengan satu query untuk diserahkan ke Tim Keuangan.

### Sebelum tiket ada

**Teks asli** (`labs/pk-300/konteks/01-aturan-pajak.md`):

> **Aturan Pemungutan Pajak Transaksi**
>
> **Pemilik:** Tim Keuangan · **Berlaku sejak:** 1 Januari 2026
>
> 1. Tarif pajak setiap produk ditentukan oleh **layanan pajak** berdasarkan kategori produk. Aplikasi tidak boleh menetapkan, menebak, atau memakai tarif cadangan sendiri.
> 2. Memungut pajak dengan tarif yang salah, terlalu rendah maupun terlalu tinggi, dikenai denda dan wajib dikoreksi ke pelanggan. Tarif 11% hanya berlaku untuk sebagian kategori.
> 3. Transaksi yang tarif pajaknya belum tersedia **tidak boleh diselesaikan**. Pelanggan diberi tahu bahwa produk itu belum bisa dibeli, dan keranjangnya tidak boleh hilang.
> 4. Koreksi pesanan lama dikerjakan Tim Keuangan secara manual. Tim teknis cukup menyerahkan daftar pesanan yang terdampak.

**Teks asli** (`labs/pk-300/konteks/02-thread-tim-pajak.md`):

> **Thread #integrasi-pajak**
>
> **Yoga (Tim Integrasi Pajak), 2 Nov 2026, 10.12**
> Mulai 1 November ada kategori produk baru, misalnya Herbal dan Kosmetik Lokal. Tarifnya masih menunggu penetapan, perkiraan pertengahan Desember.
>
> **Yoga, 10.15**
> Sampai tarif ditetapkan, layanan pajak membalas permintaan untuk produk di kategori itu dengan status 200 dan `"rate": null`. Itu bukan error dari sisi kami; artinya tarifnya memang belum ada.
>
> **Lestari (Tim Keuangan), 10.40**
> Oke. Berarti produk itu belum boleh terjual sampai tarifnya ada, ya.
>
> **Yoga, 10.42**
> Betul. Satu lagi: layanan pajak kadang mengembalikan error 5xx kalau sedang pemeliharaan, biasanya Minggu dini hari, kurang dari 10 menit.

- **Dipikirkan** *(ilustrasi)*. Yoga menulis bahwa `null` "bukan error dari sisi kami" karena ia membayangkan tim aplikasi
  akan menolak produk itu. Ia tidak bertanya bagaimana aplikasi membaca jawaban kosong, dan tidak ada yang memeriksanya.
- **Dipertimbangkan** *(ilustrasi)*. Lestari menimbang apakah perlu memblokir produk itu di katalog. Ia memilih tidak,
  karena menurutnya tim teknis yang akan menangani "belum boleh terjual".

**Teks asli** (`labs/pk-300/konteks/03-rekap-pajak-november.md`):

> **Rekap Pajak 1 sampai 22 November 2026**
>
> **Disusun oleh:** Lestari (Tim Keuangan)
>
> | Item | Nilai |
> | --- | --- |
> | Jumlah pesanan | 812.400 |
> | Pesanan dengan pajak Rp0 untuk sebagian atau semua produknya | 8.391 |
> | Pesanan dengan selisih pembulatan Rp1 | 1.204 |
> | Perkiraan pajak yang tidak terpungut | Rp61,3 juta |
>
> Catatan:
> - Selisih pembulatan Rp1 sudah dikenal sejak 2025 dan diterima auditor. Tidak perlu ditindaklanjuti.
> - Pesanan dengan pajak Rp0 untuk sebagian atau semua produknya baru muncul pada November. Oktober: nol pesanan.

- **Dipikirkan** *(ilustrasi)*. Lestari menulis catatan "Oktober: nol pesanan" sengaja, karena itu petunjuk paling kuat
  bahwa sesuatu berubah di awal November.

### Tiket datang

**Teks asli** (`labs/pk-300/LAB.md`):

> **PK-300: Invoice tanpa pajak untuk sebagian produk**
>
> > **Lestari, Tim Keuangan (Senin, 09.05):** Rekap pajak November tidak cocok. Ada pesanan yang kolom pajaknya Rp0, padahal produknya kena pajak. Kami belum tahu sejak kapan.
>
> > **Bayu, Product Manager (09.20):** Nilainya kecil dibanding total penjualan. Bisa kita abaikan dulu?
>
> > **Pak Hendra, Senior Developer (09.35):** Kalau tarifnya kosong, pakai saja 11%. Itu tarif yang paling umum.
>
> **Yang diharapkan**
>
> - Tidak ada pesanan baru yang tersimpan dengan pajak Rp0 untuk produk yang tarifnya belum tersedia.
> - Checkout yang ditolak memberi kode status dan pesan yang jelas, dan keranjang pelanggan tidak berubah.
> - Checkout untuk produk yang tarifnya tersedia tetap berhasil, dengan p95 tidak lebih dari 10% di atas patokan.
> - Pesanan lama yang terdampak (pajak produk yang tarifnya belum tersedia tercatat Rp0) bisa ditemukan dengan satu query SQL yang dilampirkan di PR.

| Siapa | Isi pesan | Dipikirkan *(ilustrasi)* | Bagaimana Ayu menilainya |
| --- | --- | --- | --- |
| Lestari | Pajak Rp0 untuk produk yang kena pajak; belum tahu sejak kapan | Laporan bulanan harus diserahkan ke kantor pajak; ia butuh daftar pesanan, bukan hanya perbaikan | Gejala utama |
| Bayu | Nilainya kecil, abaikan dulu | Ia membandingkan dengan total penjualan, bukan dengan denda | Dugaan keliru: Rp61,3 juta dan salah pungut didenda |
| Pak Hendra | Kalau tarif kosong, pakai 11% | Cara tercepat agar angka pajak "terisi" | Solusi titipan: tarif tidak boleh ditebak |

### 09.53 sampai 09.55: Ayu menyiapkan kerja

- **Dilakukan.** Ayu mengambil pembaruan repo induk lewat PR #19 (09.53). Bimo meninjaunya, tetapi menulis bahwa satu
  pemeriksaan memberi hasil kosong, padahal ada tiga berkas milik tim yang berbeda. Bimo mengoreksi komentarnya secara
  terbuka. Ayu lalu menulis rencana sesi di Issue #20 (09.54), menulis ulang tiket di Issue #21 (09.55), dan membuka PR #22
  sebagai draf dengan jurnal berisi tiga prediksi (09.55).
- **Dipikirkan.** Ayu menulis tiga risiko dengan tandanya, termasuk risiko menyentuh kode yang juga dipakai tiket PK-306.
- **Prediksi Ayu:** (1) aplikasi mengubah jawaban kosong menjadi tarif 0; (2) menolak checkout akan mengosongkan keranjang;
  (3) perbaikan tidak memengaruhi waktu checkout produk bertarif.
- **Sumber.** PR #19, Issue #20, Issue #21, PR #22, commit `de624cf`

### 09.58 sampai 10.11: Ayu mengukur patokan dan membaca kode

- **Dilakukan.** Ayu menjalankan pemanasan dan tiga run patokan, masing-masing didahului `task lab:siapkan`. Di tiga run,
  72, 67, dan 72 checkout produk tanpa tarif berhasil dengan pajak Rp0, dan jumlah itu sama dengan yang Ayu hitung di
  database per jendela jam run. Median p95 produk bertarif: 369 ms.
- **Dilakukan juga.** Ayu membaca jalur kode dan menemukan baris yang mengubah tarif `null` menjadi 0 di `TaxClient`.
  Prediksi 1 benar. Ayu menulis script yang menanyakan daftar produk tanpa tarif ke layanan pajak (50 dari 5.000 produk)
  dan query untuk pesanan lama, sambil menunggu run selesai, tanpa menyentuh kode yang sedang diukur.
- **Dipikirkan.** Ayu sempat memasang label `diagnosis` terlalu cepat, sebelum gejala direproduksi, lalu
  mengembalikannya ke `triage`.
- **Sumber.** `labs/pk-300/JURNAL.md` bagian 2 sampai 4, commit `0c77047`

### 10.12 sampai 10.13: Ayu menulis test dulu, baru kode

| Jam | Commit | Dilakukan | Dipikirkan |
| --- | --- | --- | --- |
| 10.12 | `d930833` | Ayu menambah `TaxClientTest` (4 test) dan kelas exception yang belum dipakai. Pada kode lama, 3 dari 4 test gagal | Ayu sengaja menambah kelas exception lebih dulu, supaya test gagal karena perilaku, bukan karena kode tidak bisa dikompilasi |
| 10.13 | `3012ece` | Ayu mengubah `TaxClient` dan `CheckoutController`: tarif kosong ditolak dengan 422. Test yang sama: 4 dari 4 lulus | Dua berkas diubah; jumlah pemanggilan ke layanan pajak sengaja tidak disentuh (bagian tiket PK-306) |

### 10.14 sampai 10.28: Ayu menguji prediksi dan mengukur ulang

- **Prediksi 2 diuji.** Ayu mencoba satu pelanggan dengan produk tanpa tarif: 422, keranjang 1 item sebelum dan sesudah,
  tidak ada pesanan baru. Prediksi 2 **salah**, karena seluruh checkout berjalan dalam satu transaksi. Ayu tidak perlu
  menulis kode penyimpan keranjang.
- **Dilakukan.** Tiga run sesudah perbaikan: pesanan berpajak Rp0 0, 0, 0; median p95 produk bertarif 355 ms (batas 406 ms).
  Prediksi 3 benar. Ayu menjalankan `task evidence` dari commit `3012ece` dengan pohon kerja bersih (10.27), lalu query
  pesanan lama: 448 pesanan, dijelaskan sampai habis (166 riwayat, 282 dari run patokan).
- **Sumber.** `JURNAL.md` bagian Perbaikan, komentar bukti di PR #22

### 10.32: Bimo dan Citra meninjau PR #22

| Siapa | Yang diperiksa | Dipikirkan dan diputuskan |
| --- | --- | --- |
| Bimo | Pemanggil lain, test di commit lama dan baru, asal bukti, batasan | Saat pindah ke commit lama, kompilasi gagal karena folder `target/` basi. Bimo menambahkan `rm -rf target` ke langkah pemeriksaan, dan meminta penanganan error 5xx dari layanan pajak dicatat di tindak lanjut |
| Ayu | | Ayu setuju. 5xx bukan gejala tiket ini, karena saat 5xx checkout sudah gagal, jadi pajak tidak salah pungut |
| Citra | Target, kebenaran data di database, keranjang, data lama, klaim | Citra menilai klaim sudah dibatasi, dan menyetujui |

- **Dilakukan.** Ayu menggabungkan PR #22 (10.32), menulis komentar penutupan Issue #21 dengan empat tindak lanjut, lalu
  menulis refleksi dan menutup Issue #20 (10.33).
- **Dipelajari (dari refleksi Ayu).** Menguji prediksi yang salah sebelum menulis kode menghemat kode yang tidak perlu.
  Ke depan, setiap PR yang meminta peninjau menjalankan test di commit lama menuliskan `rm -rf target` di langkah pemeriksaan.
- **Sumber.** Komentar PR #22, Issue #21, Issue #20

### Sesudah penutupan (ilustrasi)

| Siapa | Yang dilakukan | Yang dipelajari |
| --- | --- | --- |
| Lestari | Lestari mengoreksi pesanan dari daftar yang diserahkan, lalu melampirkan query-nya di laporan ke kantor pajak | Daftar yang bisa diulang lebih berguna daripada angka yang dihitung sekali |
| Yoga | Yoga menambahkan kalimat di dokumentasi layanan pajak: "`rate: null` berarti produk belum boleh dijual" | Kesepakatan arti sebuah nilai harus tertulis di kedua sisi |
| Bayu | Bayu meminta penanda "belum bisa dibeli" di katalog (tindak lanjut 3) | Nilai kecil pun bisa berarti denda besar |
| Pak Hendra | Pak Hendra meninjau tempat lain di kode yang mengganti nilai kosong dengan angka cadangan | Nilai cadangan yang diam-diam lebih berbahaya daripada error yang terlihat |

---

## Ringkasan pelajaran

| Pelajaran | Siapa yang menunjukkannya | Kapan |
| --- | --- | --- |
| Tulis risiko dengan tanda dan rencana B sebelum mulai | Ayu | Jumat 19.12 |
| Ukur patokan sebelum flag menyala | Ayu | Jumat 19.15, Sabtu 07.31 |
| Komputer uji yang kewalahan adalah temuan tentang alat ukur; turunkan beban dan tulis alasannya | Ayu | Jumat 19.32, Sabtu 07.35 |
| Tulis juga dugaan yang gugur | Ayu | Jumat 19.42 |
| Satuan yang berbeda bisa terlihat seperti angka yang bertentangan | Bimo | Jumat 19.43 |
| Peninjau kedua memeriksa hal yang belum disentuh peninjau pertama | Citra | Jumat 19.43, Sabtu 07.59 |
| Tulis prediksi sebelum mengukur | Ayu | Sabtu 07.31 |
| Nilai usul di tiket terhadap dokumen konteks, bukan pendapat | Ayu | Sabtu 07.31 sampai 07.47 |
| Informasi samping (200 x 200 dari Rudi) bisa menjadi kunci perbaikan | Rudi, Ayu | 13 November, Sabtu 07.47 |
| Uji juga prediksi yang terasa pasti, dengan cakupan penuh | Ayu | Sabtu 07.41 sampai 07.47 |
| Tulis test patokan sebelum mengubah kode | Ayu | Sabtu 07.48 |
| Bandingkan dengan patokan dari hari yang sama, dan batasi klaim | Ayu, Citra | Sabtu 07.53 sampai 07.59 |
| Masukkan hal yang belum terjelaskan ke tindak lanjut, supaya tidak hilang di jurnal | Bimo | Sabtu 07.59 |
| Ubah rencana secara terbuka saat keadaan berubah | Ayu | Sabtu 07.47 |
| Untuk bug data, tulis test yang gagal pada kode lama sebelum mengubah kode | Ayu | Jumat 27 Nov 10.12 |
| Hitung kebenaran data di database, bukan hanya dari respons | Ayu, Citra | Jumat 27 Nov 10.11 dan 10.28 |
| Koreksi komentar tinjauan sendiri secara terbuka | Bimo | Jumat 27 Nov 09.53 |
