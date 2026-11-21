package id.pasarkita.catalog;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.awt.Color;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;
import java.awt.image.AffineTransformOp;
import java.awt.image.BufferedImage;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * PK-200: URL thumbnail adalah kontrak dengan CDN dan aplikasi mobile (labs/pk-200/konteks).
 * Test ini membandingkan ThumbnailService dengan cara lama (1600x1600 lalu dikecilkan) untuk semua 255 warna.
 * Warna hanya bergantung pada productId * 37 % 255, dan 37 serta 255 tidak punya faktor bersama,
 * jadi produk 1 sampai 255 mencakup semua kemungkinan. Tidak butuh Docker atau database.
 * Jalankan: ./mvnw test -Dtest=ThumbnailServiceTest -Dsurefire.failIfNoSpecifiedTests=false
 */
class ThumbnailServiceTest {

    @BeforeAll
    static void tanpaLayar() {
        System.setProperty("java.awt.headless", "true");
    }

    /** Cara lama, disalin apa adanya dari ThumbnailService sebelum PK-200, sebagai patokan perilaku. */
    static String caraLama(Long productId) {
        BufferedImage source = new BufferedImage(1600, 1600, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = source.createGraphics();
        try {
            int shade = (int) (productId * 37 % 255);
            graphics.setPaint(new GradientPaint(0, 0, new Color(shade, 120, 200), 1600, 1600, Color.WHITE));
            graphics.fillRect(0, 0, 1600, 1600);
        } finally {
            graphics.dispose();
        }
        AffineTransformOp scale = new AffineTransformOp(
                AffineTransform.getScaleInstance(0.125, 0.125), AffineTransformOp.TYPE_BICUBIC);
        BufferedImage thumbnail = scale.filter(source, null);
        return "/thumbnails/" + productId + "-" + Integer.toHexString(thumbnail.getRGB(100, 100)) + ".jpg";
    }

    @Test
    void urlSamaDenganCaraLamaUntukSemuaWarna() {
        ThumbnailService service = new ThumbnailService();
        for (long id = 1; id <= 255; id++) {
            assertThat(service.thumbnailFor(id)).as("produk %d", id).isEqualTo(caraLama(id));
        }
    }

    @Test
    void urlUntukIdBesarTetapSama() {
        ThumbnailService service = new ThumbnailService();
        for (long id : new long[] {500_000L, 2_147_483_648L, 9_000_000_000_000L}) {
            assertThat(service.thumbnailFor(id)).as("produk %d", id).isEqualTo(caraLama(id));
        }
    }
}
