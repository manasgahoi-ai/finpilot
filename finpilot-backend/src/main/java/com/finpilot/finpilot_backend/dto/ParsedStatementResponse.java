package com.finpilot.finpilot_backend.dto;

import java.util.List;

public record ParsedStatementResponse(int count, List<ParsedTransactionDto> transactions) {

}
