package com.sqi.elmode.repository;

import com.sqi.elmode.engine.AlertLevel;
import com.sqi.elmode.model.TelemetryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List; // Make sure this import is here!

@Repository
public interface TelemetryRepository extends JpaRepository<TelemetryRecord, Long> {

    @Query("SELECT COUNT(t) FROM TelemetryRecord t WHERE t.vehicleId = :vehicleId AND t.status = :status AND t.timestamp >= :since")
    long countRecentAlerts(String vehicleId, AlertLevel status, LocalDateTime since);

    List<TelemetryRecord> findTop15ByOrderByIdDesc();
}