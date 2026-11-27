package id.pasarkita.pricing;

/**
 * Tarif pajak sebuah produk belum tersedia di layanan pajak (PK-300).
 * Aturan pajak: transaksi tanpa tarif yang sah tidak boleh diselesaikan, dan aplikasi tidak boleh menebak tarif.
 */
public class TaxRateUnavailableException extends RuntimeException {

    private final Long productId;

    public TaxRateUnavailableException(Long productId) {
        super("Produk " + productId + " belum bisa dibeli: tarif pajaknya belum tersedia.");
        this.productId = productId;
    }

    public Long productId() {
        return productId;
    }
}
