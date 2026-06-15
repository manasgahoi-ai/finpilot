package com.finpilot.finpilot_backend.service;

import com.finpilot.finpilot_backend.dto.SummaryResponse;
import com.finpilot.finpilot_backend.dto.TransactionRequest;
import com.finpilot.finpilot_backend.dto.TransactionResponse;
import com.finpilot.finpilot_backend.model.Transaction;
import com.finpilot.finpilot_backend.model.TransactionType;
import com.finpilot.finpilot_backend.model.User;
import com.finpilot.finpilot_backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
    }

    private TransactionResponse toResponse(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getAmount(),
                t.getCategory(),
                t.getDescription(),
                t.getType(),
                t.getDate(),
                t.getCreatedAt());
    }

    public List<TransactionResponse> getAllTransactions() {
        User user = getCurrentUser();
        return transactionRepository.findByUser(user)
                .stream().map(this::toResponse).toList();
    }

    public TransactionResponse createTransaction(TransactionRequest request) {
        User user = getCurrentUser();
        Transaction t = new Transaction();
        t.setAmount(request.getAmount());
        t.setCategory(request.getCategory());
        t.setDescription(request.getDescription());
        t.setType(request.getType());
        t.setDate(request.getDate());
        t.setUser(user);
        Transaction saved = transactionRepository.save(t);
        return toResponse(saved);
    }

    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        User user = getCurrentUser();
        Transaction t = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        t.setAmount(request.getAmount());
        t.setCategory(request.getCategory());
        t.setDescription(request.getDescription());
        t.setType(request.getType());
        t.setDate(request.getDate());
        Transaction updated = transactionRepository.save(t);
        return toResponse(updated);
    }

    public void deleteTransaction(Long id) {
        User user = getCurrentUser();
        Transaction t = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        transactionRepository.delete(t);
    }

    // Returns all-time summary. Monthly filtering will be added in Phase 2.
    public SummaryResponse getSummary() {
        User user = getCurrentUser();
        List<Transaction> transactions = transactionRepository.findByUser(user);

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double savingsRate = 0.0;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal savings = totalIncome.subtract(totalExpense);
            savingsRate = savings
                    .divide(totalIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        return new SummaryResponse(totalIncome, totalExpense, savingsRate);
    }
}