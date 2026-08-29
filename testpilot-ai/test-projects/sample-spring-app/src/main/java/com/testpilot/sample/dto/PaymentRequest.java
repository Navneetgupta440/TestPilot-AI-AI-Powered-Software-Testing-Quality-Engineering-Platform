package com.testpilot.sample.dto;

public class PaymentRequest {
    private double amount;
    private int customerType;
    private String currency;
    private boolean twoFactorVerified;
    private String customerEmail;

    public PaymentRequest() {}

    public PaymentRequest(double amount, int customerType, String currency, boolean twoFactorVerified, String customerEmail) {
        this.amount = amount;
        this.customerType = customerType;
        this.currency = currency;
        this.twoFactorVerified = twoFactorVerified;
        this.customerEmail = customerEmail;
    }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public int getCustomerType() { return customerType; }
    public void setCustomerType(int customerType) { this.customerType = customerType; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public boolean isTwoFactorVerified() { return twoFactorVerified; }
    public void setTwoFactorVerified(boolean twoFactorVerified) { this.twoFactorVerified = twoFactorVerified; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
}
