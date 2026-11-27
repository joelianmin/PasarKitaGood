import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Menjalankan labs/<lab>/siapkan.sql ke database lokal: data khusus lab (misalnya stok flash sale).
 * Dipakai lewat: task lab:siapkan LAB=pk-301
 * Mencoba jalur Docker dulu, lalu jalur tanpa Docker (infra/native/native.sh). Aman diulang sebelum tiap run.
 */
public class SiapkanLab {

    public static void main(String[] args) throws Exception {
        if (args.length != 1) {
            System.err.println("Pemakaian: java tools/SiapkanLab.java <lab>, contoh pk-301");
            System.exit(2);
        }
        String lab = args[0].toLowerCase();
        Path sql = Path.of("labs", lab, "siapkan.sql");
        if (!Files.exists(sql)) {
            System.out.println("Lab " + lab + " tidak butuh data khusus (tidak ada " + sql + ").");
            return;
        }
        String keluaran = jalankan(List.of("docker", "compose", "-f", "infra/compose/compose.yaml",
                "exec", "-T", "postgres", "psql", "-v", "ON_ERROR_STOP=1", "-U", "pasarkita", "-d", "pasarkita"), sql);
        String jalur = "Docker";
        if (keluaran == null && new File("infra/native/native.sh").exists()) {
            keluaran = jalankan(List.of("infra/native/native.sh", "psql", "-v", "ON_ERROR_STOP=1"), sql);
            jalur = "tanpa Docker";
        }
        if (keluaran == null) {
            System.err.println("Gagal menjalankan " + sql + ". Pastikan database berjalan dan sudah diisi (task lab atau"
                    + " task native:seed), lalu coba lagi.");
            System.exit(1);
        }
        System.out.print(keluaran);
        System.out.println("Data khusus " + lab + " siap (jalur " + jalur + ").");
    }

    /** Mengembalikan keluaran bila berhasil (kode keluar 0), null bila gagal. */
    private static String jalankan(List<String> perintah, Path masukan) {
        try {
            Process p = new ProcessBuilder(perintah).redirectErrorStream(true)
                    .redirectInput(masukan.toFile()).start();
            String out = new String(p.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            if (!p.waitFor(300, TimeUnit.SECONDS)) {
                p.destroyForcibly();
                return null;
            }
            return p.exitValue() == 0 ? out : null;
        } catch (Exception e) {
            return null;
        }
    }
}
