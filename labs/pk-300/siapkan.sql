-- PK-300: pesanan sejak 1 November yang memuat produk tanpa tarif (id berakhiran 00) tersimpan dengan pajak Rp0
-- untuk baris produk itu, seperti yang terjadi di produksi. Aman diulang.
UPDATE orders o
SET tax   = round(s.dipajaki * 0.11, 2),
    total = round(s.semua + s.dipajaki * 0.11, 2)
FROM (SELECT ol.order_id,
             sum(ol.quantity * ol.unit_price)                                                 AS semua,
             sum(CASE WHEN ol.product_id % 100 = 0 THEN 0 ELSE ol.quantity * ol.unit_price END) AS dipajaki
      FROM order_line ol
      GROUP BY ol.order_id) s
WHERE o.id = s.order_id
  AND o.created_at >= '2026-11-01 00:00+07'
  AND EXISTS (SELECT 1 FROM order_line x WHERE x.order_id = o.id AND x.product_id % 100 = 0);

-- Pelanggan untuk run reproduce (6001 sampai 7000): keranjang kosong, saldo penuh.
DELETE FROM cart_item WHERE customer_id BETWEEN 6001 AND 7000;
UPDATE wallet SET balance = 10000000 WHERE customer_id BETWEEN 6001 AND 7000;
SELECT count(*) AS pesanan_sejak_1_nov_tanpa_pajak_sebagian
FROM orders o WHERE o.created_at >= '2026-11-01 00:00+07'
  AND EXISTS (SELECT 1 FROM order_line x WHERE x.order_id = o.id AND x.product_id % 100 = 0);
