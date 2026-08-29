package com.testpilot.sample.dto;

public class PaymentResponse {
    private String transactionId;
    private String status;
    private double amount;
    private double discountApplied;
    private double fee;
    private String currency;
    private String message;

    public PaymentResponse() {}

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final PaymentResponse res = new PaymentResponse();

        public Builder transactionId(String id) { res.transactionId = id; return this; }
        public Builder status(String s) { res.status = s; return this; }
        public Builder amount(double a) { res.amount = a; return this; }
        public Builder discountApplied(double d) { res.discountApplied = d; return this; }
        public Builder fee(double f) { res.fee = f; return this; }
        public Builder currency(String c) { res.currency = c; return this; }
        public Builder message(String m) { res.message = m; return this; }
        public PaymentResponse build() { return res; }
    }

    public String getTransactionId() { return transactionId; }
    public String getStatus() { return status; }
    public double getAmount() { return amount; }
    public double getDiscountApplied() { return discountApplied; }
    public double getFee() { return fee; }
    public String getCurrency() { return currency; }
    public String getMessage() { return message; }
}
