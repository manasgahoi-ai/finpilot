package com.finpilot.finpilot_backend.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SummaryResponse {

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private Double savingsRate;
}