package com.finpilot.finpilot_backend.dto;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.finpilot.finpilot_backend.model.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {
    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @NotBlank(message = "Category is required")
    private String category;

    private String description;

    @NotNull(message = "transaction type is required")
    private TransactionType type;

    @NotNull(message = "Date is required")
    private LocalDate date;
}
