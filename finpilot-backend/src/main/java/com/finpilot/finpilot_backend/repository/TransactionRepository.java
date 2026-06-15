package com.finpilot.finpilot_backend.repository;

import com.finpilot.finpilot_backend.model.Transaction;
import com.finpilot.finpilot_backend.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);

    Optional<Transaction> findByIdAndUser(Long id, User user);
}
