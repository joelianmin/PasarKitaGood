-- PK-307: pelanggan untuk run reproduce. Aman diulang sebelum tiap run.
-- 5001 sampai 5150: saldo tidak cukup (Rp1.000). 5151 sampai 5600: saldo cukup (Rp10.000.000).
DELETE FROM cart_item WHERE customer_id BETWEEN 5001 AND 5600;
UPDATE wallet SET balance = 1000 WHERE customer_id BETWEEN 5001 AND 5150;
UPDATE wallet SET balance = 10000000 WHERE customer_id BETWEEN 5151 AND 5600;
SELECT count(*) FILTER (WHERE balance < 10000) AS saldo_kurang, count(*) FILTER (WHERE balance >= 10000) AS saldo_cukup
FROM wallet WHERE customer_id BETWEEN 5001 AND 5600;
