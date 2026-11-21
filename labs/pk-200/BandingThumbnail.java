import java.awt.Color;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;
import java.awt.image.AffineTransformOp;
import java.awt.image.BufferedImage;

/**
 * PK-200: membandingkan URL thumbnail cara sekarang (1600x1600 lalu dikecilkan) dengan cara "langsung 200x200",
 * dan mengukur waktu 60 thumbnail. Jalankan dari root repo:
 *   java -Djava.awt.headless=true -Dn=255 labs/pk-200/BandingThumbnail.java
 * Warna hanya bergantung pada productId * 37 % 255, jadi n=255 mencakup semua kemungkinan.
 */
public class BandingThumbnail {

    static String sekarang(long productId) {
        BufferedImage source = new BufferedImage(1600, 1600, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = source.createGraphics();
        try {
            int shade = (int) (productId * 37 % 255);
            g.setPaint(new GradientPaint(0, 0, new Color(shade, 120, 200), 1600, 1600, Color.WHITE));
            g.fillRect(0, 0, 1600, 1600);
        } finally {
            g.dispose();
        }
        AffineTransformOp scale = new AffineTransformOp(AffineTransform.getScaleInstance(0.125, 0.125), AffineTransformOp.TYPE_BICUBIC);
        BufferedImage t = scale.filter(source, null);
        return "/thumbnails/" + productId + "-" + Integer.toHexString(t.getRGB(100, 100)) + ".jpg";
    }

    static String langsungKecil(long productId) {
        BufferedImage t = new BufferedImage(200, 200, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = t.createGraphics();
        try {
            int shade = (int) (productId * 37 % 255);
            g.setPaint(new GradientPaint(0, 0, new Color(shade, 120, 200), 200, 200, Color.WHITE));
            g.fillRect(0, 0, 200, 200);
        } finally {
            g.dispose();
        }
        return "/thumbnails/" + productId + "-" + Integer.toHexString(t.getRGB(100, 100)) + ".jpg";
    }

    public static void main(String[] args) {
        int beda = 0;
        int n = Integer.parseInt(System.getProperty("n", "60"));
        for (long id = 1; id <= n; id++) {
            if (!sekarang(id).equals(langsungKecil(id))) beda++;
        }
        for (long id = 1; id <= 3; id++) {
            System.out.println("produk " + id + ": sekarang " + sekarang(id) + " | langsung kecil " + langsungKecil(id));
        }
        System.out.println("URL berbeda: " + beda + " dari " + n + " produk");
        long t0 = System.nanoTime();
        for (long id = 1; id <= 60; id++) sekarang(id);
        long t1 = System.nanoTime();
        for (long id = 1; id <= 60; id++) langsungKecil(id);
        long t2 = System.nanoTime();
        System.out.printf("60 thumbnail: sekarang %d ms, langsung kecil %d ms%n", (t1 - t0) / 1_000_000, (t2 - t1) / 1_000_000);
    }
}
