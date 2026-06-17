package com.finpilot.finpilot_backend.util;

import java.util.Date;
import javax.crypto.SecretKey;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

public class TokenGenerator {
    public static void main(String[] args) {
        String secretKey = "finpilot-super-secret-key-that-is-at-least-256-bits-long-for-hs256";
        String email = "abc@gmail.com";

        // Generate an expired token (expired 1 hour ago)
        long expirationTime = System.currentTimeMillis() - 3600000; // 1 hour ago

        SecretKey signingKey = Keys.hmacShaKeyFor(secretKey.getBytes());
        String expiredToken = Jwts.builder()
                .subject(email)
                .issuedAt(new Date(System.currentTimeMillis() - 86400000))
                .expiration(new Date(expirationTime))
                .signWith(signingKey)
                .compact();

        System.out.println("Expired Token: " + expiredToken);
    }
}
