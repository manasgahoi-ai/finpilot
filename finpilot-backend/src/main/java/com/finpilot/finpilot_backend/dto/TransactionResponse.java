package com.finpilot.finpilot_backend.dto;

import com.finpilot.finpilot_backend.model.TransactionType;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private Long id;
    private BigDecimal amount;
    private String category;
    private String description;
    private TransactionType type;
    private LocalDate date;
    private LocalDateTime createdAt;
}
