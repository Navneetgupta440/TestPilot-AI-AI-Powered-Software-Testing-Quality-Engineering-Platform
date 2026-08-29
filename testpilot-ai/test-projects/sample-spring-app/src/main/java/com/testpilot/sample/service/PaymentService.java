package com.testpilot.sample.service;

import com.testpilot.sample.dto.PaymentRequest;
import com.testpilot.sample.dto.PaymentResponse;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
public class PaymentService {

    /**
     * Calculates customer discount based on VIP tiers and total purchase volume.
     * Edge cases: zero price, negative amounts, invalid customer types.
     */
    public double calculateDiscount(double price, int customerType) {
        if (price < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        if (price == 0.0) {
            return 0.0;
        }

        double discountRate;
        switch (customerType) {
            case 1: // REGULAR
                discountRate = (price > 500.0) ? 0.05 : 0.0;
                break;
            case 2: // SILVER
                discountRate = (price > 1000.0) ? 0.15 : 0.10;
                break;
            case 3: // GOLD VIP
                discountRate = 0.20;
                break;
            case 4: // PLATINUM ENTERPRISE
                discountRate = (price > 5000.0) ? 0.30 : 0.25;
                break;
            default:
                throw new IllegalArgumentException("Unsupported customer tier: " + customerType);
        }

        BigDecimal discountAmount = BigDecimal.valueOf(price * discountRate)
                .setScale(2, RoundingMode.HALF_UP);
        return discountAmount.doubleValue();
    }

    /**
     * Processes transaction with fraud checks and currency conversion.
     */
    public PaymentResponse processPayment(PaymentRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Payment request payload is null");
        }
        if (request.getAmount() <= 0) {
            throw new IllegalArgumentException("Transaction amount must be strictly positive");
        }
        if (request.getCurrency() == null || request.getCurrency().trim().isEmpty()) {
            throw new IllegalArgumentException("Currency code is mandatory");
        }

        // Fraud heuristic: single charge > $10,000 without 2FA
        if (request.getAmount() > 10000.0 && !request.isTwoFactorVerified()) {
            return PaymentResponse.builder()
                    .transactionId(UUID.randomUUID().toString())
                    .status("REJECTED_SUSPECTED_FRAUD")
                    .amount(request.getAmount())
                    .fee(0.0)
                    .message("Transactions over $10,000 require verified 2FA token")
                    .build();
        }

        double discount = calculateDiscount(request.getAmount(), request.getCustomerType());
        double finalAmount = Math.max(0.0, request.getAmount() - discount);
        double gatewayFee = BigDecimal.valueOf(finalAmount * 0.029 + 0.30)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();

        return PaymentResponse.builder()
                .transactionId(UUID.randomUUID().toString())
                .status("APPROVED")
                .amount(finalAmount)
                .discountApplied(discount)
                .fee(gatewayFee)
                .currency(request.getCurrency().toUpperCase())
                .message("Payment settled successfully")
                .build();
    }

    /**
     * Validates IBAN string format according to ISO 13616.
     */
    public boolean validateIban(String iban) {
        if (iban == null) return false;
        String clean = iban.replaceAll("\\s+", "").toUpperCase();
        if (clean.length() < 15 || clean.length() > 34) return false;
        return clean.matches("^[A-Z]{2}[0-9]{2}[A-Z0-9]+$");
    }
}
