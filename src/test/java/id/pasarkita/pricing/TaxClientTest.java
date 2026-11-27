package id.pasarkita.pricing;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

/**
 * PK-300: layanan pajak membalas "rate": null untuk kategori yang tarifnya belum ditetapkan
 * (labs/pk-300/konteks). Tarif kosong tidak boleh dianggap 0 dan tidak boleh ditebak.
 * Tanpa Docker atau database. Jalankan: ./mvnw test -Dtest=TaxClientTest -Dsurefire.failIfNoSpecifiedTests=false
 */
class TaxClientTest {

    private MockRestServiceServer server;
    private TaxClient client;

    @BeforeEach
    void siapkan() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        client = new TaxClient(builder, "http://pajak");
    }

    @Test
    void tarifTersediaDipakaiApaAdanya() {
        server.expect(requestTo("http://pajak/tax/rate?productId=1201"))
                .andRespond(withSuccess("{\"rate\": 0.11}", MediaType.APPLICATION_JSON));
        assertThat(client.rateFor(1201L)).isEqualByComparingTo("0.11");
    }

    @Test
    void tarifNullDitolakBukanDianggapNol() {
        server.expect(requestTo("http://pajak/tax/rate?productId=1200"))
                .andRespond(withSuccess("{\"rate\": null}", MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> client.rateFor(1200L))
                .isInstanceOf(TaxRateUnavailableException.class)
                .hasMessageContaining("1200");
    }

    @Test
    void jawabanTanpaTarifDitolak() {
        server.expect(requestTo("http://pajak/tax/rate?productId=1300"))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        assertThatThrownBy(() -> client.rateFor(1300L)).isInstanceOf(TaxRateUnavailableException.class);
    }

    @Test
    void keranjangDenganSatuProdukTanpaTarifTidakMenghasilkanHarga() {
        server.expect(requestTo("http://pajak/tax/rate?productId=1201"))
                .andRespond(withSuccess("{\"rate\": 0.11}", MediaType.APPLICATION_JSON));
        server.expect(requestTo("http://pajak/tax/rate?productId=1200"))
                .andRespond(withSuccess("{\"rate\": null}", MediaType.APPLICATION_JSON));
        PricingService pricing = new PricingService(client);
        List<PriceLine> lines = List.of(
                new PriceLine(1201L, new BigDecimal("100000"), 1),
                new PriceLine(1200L, new BigDecimal("50000"), 2));
        assertThatThrownBy(() -> pricing.quote(lines))
                .isInstanceOf(TaxRateUnavailableException.class)
                .hasMessageContaining("1200");
    }
}
