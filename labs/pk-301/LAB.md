# PK-301: Flash sale menjual melebihi stok

> Aturan umum, alur kerja, label Issue, dan templat komentar penutupan ada di [`../MINGGU-27Nov-3Des2026.md`](../MINGGU-27Nov-3Des2026.md).
> Tiap anggota kelompok memegang satu tiket. Satu tiket hanya diambil satu orang di satu kelompok.

*Folder lab: `labs/pk-301` · Data: skala S*

> **Rina, Customer Service (Senin, 08.10):** Flash sale kemarin kacau. Produk yang stoknya 300 terjual 340. Kami harus membatalkan order satu per satu, dan pelanggan marah.

> **Bayu, Product Manager (08.25):** Server kita mungkin kewalahan saat flash sale. Bisa kita tambah replika aplikasi?

> **Pak Hendra, Senior Developer (08.40):** Tambahkan saja pengecekan stok sebelum menguranginya.

**Yang diharapkan**

- Pada skenario flash sale `task reproduce LAB=pk-301` (stok 300, permintaan jauh lebih banyak dari stok), jumlah unit terjual tidak melebihi 300, dan stok tidak pernah negatif.
- Checkout yang kehabisan stok mendapat kode status 409, bukan error server.
- p95 checkout naik tidak lebih dari 10% dari patokan.
- Pesanan yang telanjur oversold di data lama ditangani sesuai aturan di paket konteks, dengan skrip SQL yang dilampirkan di PR.

## Perintah

1. `task lab LAB=pk-301`: menyalakan infrastruktur dan mengisi data (lihat skala di atas).
2. `task app` di terminal terpisah.
3. `task lab:siapkan LAB=pk-301`: mengisi data khusus lab ini. Ulangi sebelum **setiap** run, karena checkout mengubah stok, saldo, dan keranjang.
4. `task reproduce LAB=pk-301` sekali untuk pemanasan, lalu tiga kali untuk pengukuran patokan.
   Ringkasan tersimpan di `labs/pk-301/out/baseline-table.md`.
5. Setelah perbaikanmu, ulangi pengukuran dengan cara yang sama dan bandingkan.
6. Commit semua perubahan, lalu `task evidence LAB=pk-301` dan lampirkan berkas bukti di PR. Jangan meng-commit berkas bukti.

Gunakan huruf kecil pada nilai `LAB` (`pk-301`).

## Paket konteks

Dokumen di folder [`konteks/`](konteks/). Tidak semua isinya relevan, dan beberapa isinya menjadi batasan yang harus kamu penuhi.

- [`01-aturan-flash-sale.md`](konteks/01-aturan-flash-sale.md)
- [`02-arsitektur-produksi.md`](konteks/02-arsitektur-produksi.md)
- [`03-notulen-evaluasi-flash-sale.md`](konteks/03-notulen-evaluasi-flash-sale.md)

## Catatan script k6

- Endpoint: `POST /api/cart/items` lalu `POST /api/checkout` untuk produk 4242, 8 iterasi/detik selama 75 detik, satu pelanggan berbeda per iterasi (1001 sampai 1600). Permintaan dua kali lipat stok.
- Script mencetak jumlah unit terjual menurut respons. Periksa stok di database: `SELECT quantity FROM stock WHERE product_id = 4242;`
- Data flash sale 22 November yang telanjur oversold ada pada produk 4241 (dibuat oleh `task lab:siapkan`).
- Bila komputermu kewalahan, turunkan `RATE` (misalnya `RATE=4 DURATION=150s`), dan pakai angka yang sama untuk patokan dan sesudah perbaikan.
- Beban memakai laju tetap (model terbuka), tanpa threshold lulus atau gagal. Run ini mengukur.
- Jalankan dari root repo. Hasil mentah ada di `labs/pk-301/out/` dan tidak ikut Git.
- `RATE` dan `DURATION` bisa diubah lewat variabel lingkungan (macOS dan Linux: `RATE=1 task reproduce LAB=pk-301`; PowerShell: `$env:RATE=1`) atau `-e RATE=1` pada `k6 run` langsung. Catat perubahan itu di laporanmu.
