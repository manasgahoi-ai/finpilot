package com.finpilot.finpilot_backend.statement;

import com.finpilot.finpilot_backend.dto.ParsedTransactionDto;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class StatementParser {

    List<ParsedTransactionDto> parseStatement(String statementContent) {
        return List.of();
    }
}
