package id.pasarkita.reporting;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Back-office penjual: Ringkasan Penjualan per bulan (rilis 23 November 2026).
 */
@RestController
class SalesSummaryController {

    private final SalesSummaryService summaries;

    SalesSummaryController(SalesSummaryService summaries) {
        this.summaries = summaries;
    }

    @GetMapping("/api/sellers/{id}/sales-summary")
    List<SalesSummaryService.MonthlySales> summary(@PathVariable Long id) {
        return summaries.monthlyFor(id);
    }
}
