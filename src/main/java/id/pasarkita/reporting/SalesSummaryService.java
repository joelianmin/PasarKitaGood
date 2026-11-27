package id.pasarkita.reporting;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
class SalesSummaryService {

    private static final ZoneId WIB = ZoneId.of("Asia/Jakarta");

    private final JdbcTemplate jdbc;

    SalesSummaryService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    List<MonthlySales> monthlyFor(Long sellerId) {
        List<InvoiceRow> rows = jdbc.query(
                "select issued_at, amount from invoice where seller_id = ?",
                (rs, i) -> new InvoiceRow(rs.getTimestamp("issued_at").toInstant().atZone(WIB).toLocalDate(),
                        rs.getBigDecimal("amount")),
                sellerId);

        Map<YearMonth, MonthlySales> perMonth = new TreeMap<>();
        for (InvoiceRow row : rows) {
            YearMonth month = YearMonth.from(row.date());
            MonthlySales current = perMonth.getOrDefault(month, new MonthlySales(month.toString(), 0, BigDecimal.ZERO));
            perMonth.put(month, new MonthlySales(current.month(), current.invoices() + 1, current.amount().add(row.amount())));
        }
        return new ArrayList<>(perMonth.values());
    }

    record InvoiceRow(java.time.LocalDate date, BigDecimal amount) {
    }

    public record MonthlySales(String month, long invoices, BigDecimal amount) {
    }
}
