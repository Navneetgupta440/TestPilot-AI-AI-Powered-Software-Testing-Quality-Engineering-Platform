package com.testpilot.sample.controller;

import com.testpilot.sample.dto.PaymentRequest;
import com.testpilot.sample.dto.PaymentResponse;
import com.testpilot.sample.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
        try {
            PaymentResponse response = paymentService.processPayment(request);
            if ("REJECTED_SUSPECTED_FRAUD".equals(response.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "VALIDATION_FAILED");
            err.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/discount-quote")
    public ResponseEntity<Map<String, Object>> getDiscountQuote(
            @RequestParam double price,
            @RequestParam(defaultValue = "1") int customerType) {
        double discount = paymentService.calculateDiscount(price, customerType);
        Map<String, Object> res = new HashMap<>();
        res.put("originalPrice", price);
        res.put("customerType", customerType);
        res.put("discountAmount", discount);
        res.put("netPrice", price - discount);
        return ResponseEntity.ok(res);
    }
}
