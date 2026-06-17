package com.finpilot.finpilot_backend.dto;

import com.finpilot.finpilot_backend.model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StatementUploadResponse {
    private LocalDate date;
    private String description;
    private BigDecimal amount;
    private TransactionType transactionType;
    private String category;
}
