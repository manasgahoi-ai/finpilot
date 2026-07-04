package com.finpilot.finpilot_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import com.finpilot.finpilot_backend.client.MlServiceClient;
import com.finpilot.finpilot_backend.dto.ParsedStatementResponse;
import com.finpilot.finpilot_backend.dto.ParsedTransactionDto;
import com.finpilot.finpilot_backend.dto.TransactionRequest;
import com.finpilot.finpilot_backend.dto.TransactionResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StatementService {
    private final MlServiceClient mlServiceClient;
    private final TransactionService transactionService;

    public ParsedStatementResponse parseStatement(MultipartFile file, String password) {
        try {
            byte[] fileBytes = file.getBytes();
            return mlServiceClient.parseStatement(fileBytes, password);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file", e);
        }
    }

    private List<TransactionRequest> toTransactionRequests(List<ParsedTransactionDto> parsedTransactions) {
        return parsedTransactions.stream()
                .map(pt -> new TransactionRequest(
                        pt.getAmount(),
                        pt.getCategory(),
                        pt.getDescription(),
                        pt.getType(),
                        pt.getDate()))
                .toList();
    }

    public List<TransactionResponse> confirmStatement(List<ParsedTransactionDto> parsedTransactions) {
        List<TransactionRequest> transactionRequests = toTransactionRequests(parsedTransactions);
        return transactionRequests.stream()
                .map(transactionService::createTransaction)
                .toList();
    }

}
