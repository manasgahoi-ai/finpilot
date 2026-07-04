package com.finpilot.finpilot_backend.dto;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ConfirmStatementRequest {
    @NotEmpty
    @Valid
    private List<ParsedTransactionDto> transactions;

}
