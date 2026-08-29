package com.testpilot.sample;

import com.testpilot.sample.dto.PaymentRequest;
import com.testpilot.sample.dto.PaymentResponse;
import com.testpilot.sample.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PaymentServiceTest {

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService();
    }

    @Test
    @DisplayName("Should apply regular discount when price > 500")
    void shouldApplyRegularDiscount() {
        double discount = paymentService.calculateDiscount(600.0, 1);
        assertEquals(30.0, discount, 0.001);
    }

    @Test
    @DisplayName("Should approve valid regular payment")
    void shouldProcessStandardPayment() {
        PaymentRequest req = new PaymentRequest(100.0, 1, "USD", false, "alice@example.com");
        PaymentResponse res = paymentService.processPayment(req);

        assertNotNull(res.getTransactionId());
        assertEquals("APPROVED", res.getStatus());
        assertEquals(100.0, res.getAmount());
    }

    // NOTICE: Missing tests for boundary conditions (price < 0, customerType unknown),
    // Missing test for fraud flag (> 10,000 without 2FA),
    // Missing test for IBAN validator!
}
