-- PK-300: pesanan sejak 1 November 2026 yang memuat produk yang tarif pajaknya belum tersedia.
-- Hasilnya diserahkan ke Tim Keuangan untuk dikoreksi (aturan pajak poin 4). Query ini tidak mengubah data.
-- Langkah:
--   1. k6 run -e PRODUCTS=<jumlah produk> labs/pk-300/produk-tanpa-tarif.k6.js
--   2. Jalankan berkas ini dari root repo, misalnya: infra/native/native.sh psql -f labs/pk-300/pesanan-terdampak.sql
CREATE TEMP TABLE produk_tanpa_tarif (product_id bigint PRIMARY KEY);
\copy produk_tanpa_tarif FROM 'labs/pk-300/out/produk-tanpa-tarif.csv'

SELECT o.id                                 AS order_id,
       o.created_at,
       o.status,
       o.tax                                AS pajak_tercatat,
       sum(ol.quantity * ol.unit_price)     AS nilai_produk_tanpa_tarif
FROM orders o
         JOIN order_line ol ON ol.order_id = o.id
         JOIN produk_tanpa_tarif t ON t.product_id = ol.product_id
WHERE o.created_at >= '2026-11-01 00:00+07'
GROUP BY o.id, o.created_at, o.status, o.tax
ORDER BY o.created_at;
