-- PK-301: data flash sale. Aman diulang sebelum tiap run.
-- Produk 4242: flash sale berikutnya, stok 300 (dipakai task reproduce LAB=pk-301).
-- Produk 4241: flash sale 22 November, 340 pesanan untuk stok 300 (data lama yang telanjur oversold).
BEGIN;
UPDATE product SET name = 'Rice Cooker Mini (Flash Sale 4 Des)' WHERE id = 4242;
UPDATE product SET name = 'Rice Cooker Mini (Flash Sale 22 Nov)' WHERE id = 4241;
UPDATE stock SET quantity = 300 WHERE product_id = 4242;
UPDATE stock SET quantity = 0 WHERE product_id = 4241;

-- Pelanggan untuk run reproduce: keranjang kosong, saldo penuh.
DELETE FROM cart_item WHERE customer_id BETWEEN 1001 AND 3000;
UPDATE wallet SET balance = 10000000 WHERE customer_id BETWEEN 1001 AND 3000;

-- Hapus data flash sale 22 November dari run sebelumnya, lalu buat ulang.
CREATE TEMP TABLE fs_lama AS
SELECT DISTINCT ol.order_id FROM order_line ol JOIN orders o ON o.id = ol.order_id
WHERE ol.product_id = 4241 AND o.created_at >= '2026-11-22 20:00+07' AND o.created_at < '2026-11-22 20:02+07';
DELETE FROM shipment WHERE order_id IN (SELECT order_id FROM fs_lama);
DELETE FROM loyalty_point WHERE order_id IN (SELECT order_id FROM fs_lama);
DELETE FROM invoice WHERE order_id IN (SELECT order_id FROM fs_lama);
DELETE FROM order_line WHERE order_id IN (SELECT order_id FROM fs_lama);
DELETE FROM orders WHERE id IN (SELECT order_id FROM fs_lama);

CREATE TEMP TABLE fs_baru AS
SELECT g AS customer_id,
       timestamptz '2026-11-22 20:00:00+07' + (g * 90.0 / 340) * interval '1 second' AS dibuat,
       p.price, p.seller_id
FROM generate_series(1, 340) g, product p WHERE p.id = 4241;

WITH o AS (
    INSERT INTO orders (customer_id, status, total, tax, created_at)
    SELECT customer_id, 'PAID', round(price * 1.11, 2), round(price * 0.11, 2), dibuat FROM fs_baru
    RETURNING id, customer_id, total, created_at)
INSERT INTO order_line (order_id, product_id, quantity, unit_price)
SELECT o.id, 4241, 1, f.price FROM o JOIN fs_baru f ON f.customer_id = o.customer_id;

INSERT INTO invoice (order_id, seller_id, amount, issued_at)
SELECT o.id, f.seller_id, f.price, o.created_at
FROM orders o JOIN order_line ol ON ol.order_id = o.id AND ol.product_id = 4241
JOIN fs_baru f ON f.customer_id = o.customer_id
WHERE o.created_at >= '2026-11-22 20:00+07' AND o.created_at < '2026-11-22 20:02+07';

INSERT INTO loyalty_point (customer_id, order_id, points, created_at)
SELECT o.customer_id, o.id, floor(o.total / 10000)::int, o.created_at
FROM orders o JOIN order_line ol ON ol.order_id = o.id AND ol.product_id = 4241
WHERE o.created_at >= '2026-11-22 20:00+07' AND o.created_at < '2026-11-22 20:02+07';

INSERT INTO shipment (order_id, status, created_at)
SELECT o.id, 'REQUESTED', o.created_at
FROM orders o JOIN order_line ol ON ol.order_id = o.id AND ol.product_id = 4241
WHERE o.created_at >= '2026-11-22 20:00+07' AND o.created_at < '2026-11-22 20:02+07';

-- Saldo 340 pembeli flash sale 22 November sudah terpotong sebesar pesanannya.
UPDATE wallet w SET balance = 10000000 - round(f.price * 1.11, 2)
FROM fs_baru f WHERE w.customer_id = f.customer_id;
COMMIT;

SELECT (SELECT quantity FROM stock WHERE product_id = 4242) AS stok_flash_sale_4_des,
       (SELECT count(*) FROM order_line ol JOIN orders o ON o.id = ol.order_id WHERE ol.product_id = 4241
          AND o.created_at >= '2026-11-22 20:00+07' AND o.created_at < '2026-11-22 20:02+07') AS pesanan_flash_sale_22_nov;
