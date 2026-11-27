package id.pasarkita.order;

import id.pasarkita.pricing.TaxRateUnavailableException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
class CheckoutController {

    private final CheckoutService checkout;

    CheckoutController(CheckoutService checkout) {
        this.checkout = checkout;
    }

    @PostMapping("/api/checkout")
    CheckoutService.CheckoutResult checkout(@RequestHeader("X-Customer-Id") Long customerId) {
        return checkout.checkout(customerId);
    }

    /** PK-300: produk tanpa tarif pajak belum bisa dibeli; transaksi dibatalkan, keranjang tetap. */
    @ExceptionHandler(TaxRateUnavailableException.class)
    ResponseEntity<ProblemDetail> tarifBelumTersedia(TaxRateUnavailableException e) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, e.getMessage());
        problem.setTitle("Tarif pajak belum tersedia");
        problem.setProperty("productId", e.productId());
        return ResponseEntity.unprocessableEntity().body(problem);
    }
}
