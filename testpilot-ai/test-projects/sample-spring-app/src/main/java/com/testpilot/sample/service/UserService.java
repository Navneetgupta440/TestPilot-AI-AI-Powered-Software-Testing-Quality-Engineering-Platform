package com.testpilot.sample.service;

import org.springframework.stereotype.Service;
import java.util.regex.Pattern;

@Service
public class UserService {

    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    public boolean isValidEmail(String email) {
        if (email == null || email.isBlank()) return false;
        return EMAIL_PATTERN.matcher(email).matches();
    }

    public boolean validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) return false;
        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;

        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }

        return hasUpper && hasLower && hasDigit && hasSpecial;
    }

    public String resolveUserRole(int accountLevel, boolean isInternalEmployee) {
        if (isInternalEmployee) {
            return accountLevel >= 5 ? "SUPER_ADMIN" : "STAFF_OPERATOR";
        }
        return switch (accountLevel) {
            case 1 -> "STANDARD_USER";
            case 2 -> "PREMIUM_USER";
            case 3 -> "ENTERPRISE_USER";
            default -> "GUEST";
        };
    }
}
