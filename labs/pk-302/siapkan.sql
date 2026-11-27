-- PK-302: pelanggan untuk run reproduce (3001 sampai 3600): keranjang kosong, saldo awal 10.000.000. Aman diulang.
DELETE FROM cart_item WHERE customer_id BETWEEN 3001 AND 3600;
UPDATE wallet SET balance = 10000000 WHERE customer_id BETWEEN 3001 AND 3600;
SELECT count(*) AS wallet_disiapkan FROM wallet WHERE customer_id BETWEEN 3001 AND 3600;
