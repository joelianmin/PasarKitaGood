# Tiket 27 Nov - 3 Des 2026 (Kebenaran data, transaksi, dan integrasi)

## Cara mengerjakan tiket

Setiap tiket adalah satu lab. Setiap anggota memegang tepat satu tiket sebagai pemilik, jadi kelompok beranggota N (satu sampai tujuh orang) mengambil N tiket berbeda dari tujuh tiket PK-301 sampai PK-307 di bawah. PK-300 adalah tiket contoh yang dikerjakan dari awal sampai ditutup di repo https://github.com/joelianmin/PasarKitaGood, dan tidak dipilih kelompok. Satu tiket hanya diambil satu orang di satu kelompok. Orang yang mengerjakan PK-207 pada 20–26 Nov tidak mengambil PK-303, karena keduanya menyentuh pemanggilan gateway pembayaran; anggota lain di kelompoknya boleh. Tiket ditulis seperti percakapan sungguhan antara orang-orang di PasarKita, jadi tidak semua pendapat di dalamnya benar. Tugasmu menemukan akar masalah dan membuktikannya, bukan menjalankan saran yang ada di tiket. Materi pendukung: `docs/materi/09-dari-diagnosis-ke-perbaikan.md`, dan contoh satu tiket dari awal sampai ditutup: `docs/CONTOH-PERBAIKAN-TIKET.md`. Templat jurnal diagnosis dan daftar asumsi: `docs/templat/JURNAL-DIAGNOSIS.md`.

Tiket minggu ini berbeda dari 20–26 Nov. Sebagian besar gejalanya bukan "lambat", melainkan **data yang salah**: stok, saldo, pesanan, pajak, dan email. Perbaikan yang membuat angka waktu respons bagus tetapi datanya tetap salah tidak menyelesaikan tiket. Karena itu, setiap tiket punya target kebenaran data selain target waktu.

### Alur kerja

1. **Prediksi.** Sebelum menyentuh perangkat, tulis dugaanmu tentang penyebab masalah di jurnal diagnosis.
2. **Baca paket konteks.** Setiap tiket punya paket konteks bisnis berisi dokumen seperti notulen rapat, thread chat, dan kebijakan. Catat setiap batasan yang kamu temukan beserta sumbernya di daftar asumsi. Tidak semua isi paket relevan. Kebijakan dari paket konteks tiket 20–26 Nov tetap berlaku bila disebut ulang.
3. **Triage.** Klasifikasi setiap sinyal di tiket: gejala utama, akibat, kebetulan waktu, noise, dugaan keliru, atau solusi titipan.
4. **Reproduksi.** Siapkan lab dengan `task lab LAB=<folder lab>`, ukur dengan `task reproduce LAB=<folder lab>` (contoh: `LAB=pk-301`, huruf kecil), dan tulis cara mereproduksi masalahnya yang bisa diulang orang lain: skrip k6, SQL, atau curl. Gangguan layanan luar dinyalakan dengan `task chaos SCENARIO=<nama>` dan dimatikan dengan `task chaos:selesai`.
5. **Diagnosis dan perbaikan.** Temukan akar masalah, bandingkan minimal dua alternatif, lalu buka PR. Untuk bug kebenaran data, tulis test yang **gagal pada kode lama** sebelum mengubah kode.
6. **Penutupan.** Setelah PR mendapat dua persetujuan (aturan peninjau di bawah), jalankan `task evidence LAB=<folder lab>` dan tutup tiket dengan komentar penutupan.

Target waktu dihitung relatif terhadap patokan yang kamu ukur sendiri di komputer yang sama sebelum mengubah kode, kecuali disebutkan lain. Tidak ada sesi tanya jawab bisnis: semua batasan ada di paket konteks, dan kamu yang harus menemukannya. Batasan yang terlewat akan ditemukan dua peninjau PR dan pengajar saat membaca komentar penutupanmu, jadi catat tiap batasan beserta sumbernya di daftar asumsi.

### Mengambil pembaruan

Ambil pembaruan templat dengan [`docs/PANDUAN-PEMBARUAN.md`](../docs/PANDUAN-PEMBARUAN.md). Minggu ini ada tambahan kode di
modul `reporting` (fitur Ringkasan Penjualan, dipakai PK-305). Pada langkah 6 panduan itu, tambahkan folder modul itu:

```bash
git checkout templat/main -- Taskfile.yml infra tools labs docs .github README.md src/main/java/id/pasarkita/reporting
```

Folder `reporting` sebelumnya hanya berisi `ReportingModule.java`, jadi pekerjaanmu di modul lain tidak tersentuh.

### Peninjau PR

Tiap PR butuh **dua persetujuan** sebelum tiket ditutup, dan pemilik tiket tidak boleh menyetujui PR-nya sendiri. Dua persetujuan itu datang dari:

| Anggota kelompok | Peninjau |
| --- | --- |
| 3 sampai 7 orang | Dua anggota lain di kelompok |
| 2 orang | Rekan satu kelompok dan **satu teman dari kelompok lain** |
| 1 orang | **Dua teman dari kelompok lain** |

Peninjau memakai daftar periksa di Bagian 9.7 dan menulis persetujuan sebagai review "Approve" di GitHub, dengan komentar yang menyebut apa yang diperiksa. Untuk tiket minggu ini, peninjau juga menjalankan test kebenaran data di PR.

**Mencari teman peninjau (kelompok satu atau dua orang).**

- Carilah teman dari kelompok lain di awal sesi, dan tawarkan **tukar tinjau**: kamu meninjau PR mereka, mereka meninjau PR-mu. Kelompok kecil lain biasanya paling mudah diajak.
- Undang temanmu sebagai collaborator dengan akses **Read** di repo kelompokmu (Settings, Collaborators). Peninjau hanya membaca dan memberi review. Repo privat memuat `group.env`, jadi peninjau dari luar kelompok **tidak boleh membagikan isi repo**, termasuk `GROUP_SEED`, kepada siapa pun.
- Dua peninjau dari luar kelompok sebaiknya orang yang berbeda dan tidak memegang tiket yang sama denganmu.
- Bila sampai **Selasa 1 Desember 2026, 18.00 WIB** kamu belum menemukan teman, pasang label `review` pada Issue tiketmu. Pengajar akan menggantikan peninjau yang kurang, supaya PR-mu tidak tertahan.

### Label issue

| Label | Arti |
| --- | --- |
| `triage` | Sinyal sedang diklasifikasi dan dugaan sedang disusun |
| `diagnosis` | Gejala sudah direproduksi; akar masalah sedang dicari |
| `review` | PR perbaikan sudah dibuka dan menunggu dua persetujuan |
| `selesai` | Bukti sudah dibuat dan komentar penutupan sudah ditulis |

### Template komentar penutupan

```markdown
## Penutupan

**Akar masalah:** <satu sampai dua kalimat>

**Sinyal di tiket:**
| Sinyal | Status | Bukti |
| --- | --- | --- |

**Batasan dari paket konteks:**
| Batasan | Sumber (berkas) | Bagaimana dipenuhi |
| --- | --- | --- |

**Alternatif yang dipertimbangkan:** <minimal dua, beserta alasan memilih atau menolak>

**Perbaikan:** PR #<nomor>

**Hasil:**
| Metrik | Sebelum | Sesudah |
| --- | --- | --- |

**Kebenaran data:** <test yang gagal pada kode lama dan lulus sesudahnya; hasil pemeriksaan SQL>

**Bukti:** <nama file dari task evidence>

**Tindak lanjut:** <hal yang sengaja dibiarkan atau perlu dikerjakan nanti>
```
