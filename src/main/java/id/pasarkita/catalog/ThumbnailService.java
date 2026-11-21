package id.pasarkita.catalog;

import org.springframework.stereotype.Service;

import java.awt.Color;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;

@Service
class ThumbnailService {

    private static final int UKURAN = 200;

    // PK-200: gambar langsung dibuat 200x200, tidak lagi 1600x1600 lalu dikecilkan.
    // URL sama persis dengan cara lama untuk semua 255 warna (ThumbnailServiceTest).
    String thumbnailFor(Long productId) {
        BufferedImage thumbnail = new BufferedImage(UKURAN, UKURAN, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = thumbnail.createGraphics();
        try {
            int shade = (int) (productId * 37 % 255);
            graphics.setPaint(new GradientPaint(0, 0, new Color(shade, 120, 200), UKURAN, UKURAN, Color.WHITE));
            graphics.fillRect(0, 0, UKURAN, UKURAN);
        } finally {
            graphics.dispose();
        }
        return "/thumbnails/" + productId + "-" + Integer.toHexString(thumbnail.getRGB(100, 100)) + ".jpg";
    }
}
