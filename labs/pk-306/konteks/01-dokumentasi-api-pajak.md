# Dokumentasi Layanan Pajak

**Pemilik:** Yoga (Tim Integrasi Pajak) · **Versi API:** 2

| Endpoint | Isi | Latensi khas |
| --- | --- | --- |
| `GET /tax/rate?productId=<id>` | Tarif satu produk | 40 ms |
| `POST /tax/rates` dengan isi `{"productIds": [...]}` | Tarif sampai **50 produk** sekaligus, dijawab `{"rates": {"<id>": <tarif>}}` | 50 ms |

- Batas pemakaian: **20 permintaan per detik per instance aplikasi**.
- Tarif bisa berubah kapan saja saat pemerintah menetapkan kategori baru. Salinan tarif di sisi aplikasi boleh dipakai **paling lama 10 menit**.
- Produk yang tarifnya belum ditetapkan dijawab dengan tarif `null`.
