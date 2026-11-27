import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Menyalakan atau mematikan gangguan layanan luar tiruan (WireMock) untuk lab.
 * Dipakai lewat: task chaos SCENARIO=gateway-hang | email-error, dan task chaos:selesai
 * Gangguan ditambahkan sebagai stub berprioritas tinggi lewat API admin WireMock, jadi berkas di
 * infra/compose/wiremock/mappings tidak berubah. Berlaku untuk jalur Docker maupun tanpa Docker.
 */
public class Chaos {

    private static final String WIREMOCK = System.getenv().getOrDefault("WIREMOCK_URL", "http://localhost:8089");
    private static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private static final DateTimeFormatter JAM = DateTimeFormatter.ofPattern("HH.mm.ss");

    public static void main(String[] args) throws Exception {
        if (args.length == 2 && args[0].equals("mulai")) {
            List<String> stub = switch (args[1]) {
                case "gateway-hang" -> gatewayHang();
                case "email-error" -> emailError();
                default -> null;
            };
            if (stub == null) {
                System.err.println("Skenario tidak dikenal: " + args[1] + ". Pilihan: gateway-hang, email-error.");
                System.exit(2);
            }
            hapusGangguan();
            for (String s : stub) {
                kirim("POST", "/__admin/mappings", s);
            }
            kirim("POST", "/__admin/scenarios/reset", "");
            System.out.println("Gangguan " + args[1] + " DINYALAKAN pukul " + jam() + " WIB. Matikan dengan: task chaos:selesai");
        } else if (args.length == 1 && args[0].equals("selesai")) {
            hapusGangguan();
            kirim("POST", "/__admin/scenarios/reset", "");
            System.out.println("Semua gangguan DIMATIKAN pukul " + jam() + " WIB. Layanan tiruan kembali normal.");
        } else {
            System.err.println("Pemakaian: java tools/Chaos.java mulai <gateway-hang|email-error> | selesai");
            System.exit(2);
        }
    }

    /** Gateway pembayaran tidak membalas: setiap otorisasi ditahan 120 detik. */
    private static List<String> gatewayHang() {
        return List.of("""
                {"priority": 1, "metadata": {"chaos": "gateway-hang"},
                 "request": {"method": "POST", "urlPath": "/payments/authorize"},
                 "response": {"status": 200, "headers": {"Content-Type": "application/json"},
                              "jsonBody": {"status": "APPROVED"}, "fixedDelayMilliseconds": 120000}}
                """);
    }

    /** Layanan email: 3 dari setiap 10 permintaan gagal dengan 503, bergiliran (deterministik). */
    private static List<String> emailError() {
        List<String> stub = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            String state = i == 0 ? "Started" : "s" + i;
            String next = (i + 1) % 10 == 0 ? "Started" : "s" + (i + 1);
            boolean gagal = i == 2 || i == 5 || i == 8;
            stub.add("""
                    {"priority": 1, "metadata": {"chaos": "email-error"},
                     "scenarioName": "email-error", "requiredScenarioState": "%s", "newScenarioState": "%s",
                     "request": {"method": "POST", "urlPath": "/notifications/send"},
                     "response": {"status": %d, "fixedDelayMilliseconds": 80}}
                    """.formatted(state, next, gagal ? 503 : 202));
        }
        return stub;
    }

    private static void hapusGangguan() throws Exception {
        kirim("POST", "/__admin/mappings/remove-by-metadata",
                "{\"matchesJsonPath\": \"$.chaos\"}");
    }

    private static void kirim(String metode, String path, String isi) throws Exception {
        HttpRequest req = HttpRequest.newBuilder(URI.create(WIREMOCK + path))
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "application/json")
                .method(metode, HttpRequest.BodyPublishers.ofString(isi))
                .build();
        HttpResponse<String> res;
        try {
            res = HTTP.send(req, HttpResponse.BodyHandlers.ofString());
        } catch (java.io.IOException e) {
            System.err.println("WireMock tidak bisa dihubungi di " + WIREMOCK
                    + ". Pastikan infrastruktur berjalan (task up atau task native:up), lalu coba lagi.");
            System.exit(1);
            return;
        }
        if (res.statusCode() >= 300) {
            System.err.println("WireMock menolak " + path + " (status " + res.statusCode() + "): " + res.body());
            System.exit(1);
        }
    }

    private static String jam() {
        return ZonedDateTime.now(ZoneId.of("Asia/Jakarta")).format(JAM);
    }
}
