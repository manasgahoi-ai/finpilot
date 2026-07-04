package com.finpilot.finpilot_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.finpilot.finpilot_backend.dto.ConfirmStatementRequest;
import com.finpilot.finpilot_backend.dto.ParsedStatementResponse;
import com.finpilot.finpilot_backend.dto.TransactionResponse;
import com.finpilot.finpilot_backend.service.StatementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.MediaType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/statement")
@RequiredArgsConstructor
public class StatementController {
    private final StatementService statementService;

    @PostMapping(path = "/parse-statement", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ParsedStatementResponse> parseStatement(@RequestParam("file") MultipartFile file,
            @RequestParam(value = "password", required = false) String password) {

        return ResponseEntity.ok(statementService.parseStatement(file, password));

    }

    @PostMapping("/statements/confirm")
    public ResponseEntity<List<TransactionResponse>> confirmStatementRequest(
            @Valid @RequestBody ConfirmStatementRequest request) {

        return ResponseEntity.ok(statementService.confirmStatement(request.getTransactions()));
    }

}
