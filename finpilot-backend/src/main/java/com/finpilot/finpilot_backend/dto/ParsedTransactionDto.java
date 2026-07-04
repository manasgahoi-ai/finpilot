package com.finpilot.finpilot_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.finpilot.finpilot_backend.model.TransactionType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParsedTransactionDto {
    private LocalDate date;
    private String description;
    private BigDecimal amount;
    private TransactionType type;
    private String category;
}
