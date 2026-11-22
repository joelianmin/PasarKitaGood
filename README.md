# PasarKitaGood: contoh pengerjaan tiket di dunia kerja

Repo ini menunjukkan bagaimana sebuah tim backend mengerjakan tiket dengan baik, dari rencana sampai tiket ditutup:
diagnosis dengan bukti, keputusan yang menghormati batasan bisnis, perubahan kode yang diuji, tinjauan rekan, dan
catatan yang bisa diperiksa orang lain. **Kode, perintah, dan semua angka nyata**: diukur pada 20 dan 21 November 2026
di komputer uji Intel Core i5-5250U (2 core, 4 thread), RAM 8 GB, macOS 12, tanpa Docker, data skala S.

Repo ini dibuat dari repo induk [PasarKita](https://github.com/joelianmin/PasarKita), tempat mahasiswa mengerjakan tiket
mereka sendiri. PasarKitaGood bukan tugas: ia teladan yang bisa dibandingkan dengan pekerjaanmu.

**Peran.** Satu akun GitHub memerankan tiga anggota tim: **Ayu** (pemilik tiket), **Bimo** dan **Citra** (peninjau).
Tinjauan ditulis sebagai komentar bertanda peran, karena GitHub tidak mengizinkan penulis PR menyetujui PR-nya sendiri.
Di tim sungguhan, setiap peninjau memakai akunnya sendiri dan menekan Approve.

## Urutan membaca

Diurutkan menurut waktu, dari tiket dan dokumen konteks yang sudah ada sampai tiket ditutup.

| # | Kapan | Apa | Tempat | Yang patut ditiru / diperhatikan |
| --- | --- | --- | --- | --- |
| 1 | 1 Okt 2026 | Paket konteks PK-200: anggaran infrastruktur (Tim Platform) | [`labs/pk-200/konteks/03-anggaran-infrastruktur.md`](labs/pk-200/konteks/03-anggaran-infrastruktur.md) | Batasan keras: tidak ada server tambahan |
| 2 | 12 Nov 2026 | Paket konteks PK-200: keputusan produk (Bayu) | [`labs/pk-200/konteks/01-keputusan-produk-thumbnail.md`](labs/pk-200/konteks/01-keputusan-produk-thumbnail.md) | Batasan keras: flag tetap menyala, URL thumbnail tidak boleh berubah |
| 3 | 13 Nov 2026 | Paket konteks PK-200: thread CDN (Rudi, Tomi, Bayu) | [`labs/pk-200/konteks/02-thread-cdn.md`](labs/pk-200/konteks/02-thread-cdn.md) | Alasan di balik batasan URL; informasi samping 200 x 200 yang menjadi kunci perbaikan |
| 4 | Jumat 20 Nov, dibaca 19.12 (jam laporan 19.28) | Tiket #4821 (Tim Dukungan Penjual) | [`labs/latihan/TIKET.md`](labs/latihan/TIKET.md) | Gejala dari sudut pandang pengguna, bukan penyebab |
| 5 | Jumat 20 Nov, 19.12 | Rencana sesi | [Issue #1](https://github.com/joelianmin/PasarKitaGood/issues/1) | Risiko dengan tanda dan rencana B; komentar Cek, Perubahan (sesi terbelah semalam), dan Refleksi |
| 6 | Jumat 20 Nov, 19.12 sampai 19.44 | Diagnosis #4821 | [Issue #2](https://github.com/joelianmin/PasarKitaGood/issues/2), [PR #3](https://github.com/joelianmin/PasarKitaGood/pull/3), [`LAPORAN-4821.md`](labs/latihan/LAPORAN-4821.md) | Sepuluh bukti dengan jam WIB/UTC; `RATE=1` saat komputer uji kewalahan; dugaan yang gugur ditulis; tinjauan menemukan satuan CPU yang bercampur |
| 7 | Sabtu 21 Nov, 07.30 | Mengambil pembaruan repo induk | [PR #4](https://github.com/joelianmin/PasarKitaGood/pull/4) | Pembaruan masuk lewat PR, tanpa menyentuh pekerjaan tim |
| 8 | Sabtu 21 Nov, 07.31 | Tiket PK-200 (Maya, Eko, Dimas) | [`labs/pk-200/LAB.md`](labs/pk-200/LAB.md) | Dua usul di tiket adalah solusi titipan; nilai terhadap paket konteks (baris 1 sampai 3) |
| 9 | Sabtu 21 Nov, 07.31 sampai 07.59 | Perbaikan PK-200 | [Issue #5](https://github.com/joelianmin/PasarKitaGood/issues/5), [PR #6](https://github.com/joelianmin/PasarKitaGood/pull/6), [`JURNAL.md`](labs/pk-200/JURNAL.md) | Prediksi sebelum mengukur; batasan dari paket konteks; prediksi yang salah diuji (255 warna); test patokan ditulis sebelum kode diubah; `task evidence` dari commit bersih; komentar penutupan lengkap |

Teks tiket #4821 sudah ada di repo sejak awal; jam laporannya (19.28) adalah jam yang dicetak `task latihan:mulai`. Tiket PK-200
di dalam cerita bertanggal Senin; di repo ini ia dibaca Sabtu 07.31 setelah pembaruan repo induk diambil.

Urutan waktu lengkap, termasuk apa yang dipikirkan, dipertimbangkan, dan dipelajari setiap pemangku kepentingan (anggota
tim, pelapor, Product, CDN, Platform): [`KRONOLOGI.md`](KRONOLOGI.md).

Label tiket bergerak `triage` → `diagnosis` → `review` → `selesai`.

## Hasil singkat

| PK-200, 2 req/detik, flag tetap menyala | Flag mati (patokan) | Sebelum perbaikan | Sesudah perbaikan |
| --- | --- | --- | --- |
| Waktu respons toko terbesar (p95) | 22 ms | sekitar 57 detik, 40,7% request gagal | **39 ms**, 0 gagal |
| Isi respons | | | Sama persis dengan sebelum perbaikan |

## Yang patut ditiru

| Kebiasaan | Di mana |
| --- | --- |
| Risiko ditulis dengan tanda dan rencana B, lalu rencana diubah secara terbuka saat keadaan berubah | Issue #1 |
| Patokan diukur sebelum masalah dinyalakan, dan dugaan yang gugur tetap ditulis | Issue #2, `LAPORAN-4821.md` |
| Usul di tiket dinilai terhadap dokumen konteks, bukan pendapat | `JURNAL.md` bagian 2 dan 3 |
| Prediksi yang terasa pasti tetap diuji, dengan cakupan penuh | `BandingThumbnail.java`, 255 warna |
| Test patokan ditulis sebelum kode diubah | Commit `48cab1c` lalu `0f51d95` |
| Peninjau memeriksa hal yang berbeda dan menyebut apa yang mereka periksa | PR #3, PR #6 |
| Hal yang belum terjelaskan masuk tindak lanjut | Penutupan Issue #5 |

## Ingin menjalankan sendiri?

Cara memasang alat, menjalankan aplikasi, dan mengulang pengukuran contoh ini ada di
[`MENJALANKAN-SENDIRI.md`](MENJALANKAN-SENDIRI.md).

Tiket berikutnya ditambahkan ke repo ini setelah tenggat pengerjaan mahasiswa lewat.

