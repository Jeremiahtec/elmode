package com.sqi.elmode.model;

import com.sqi.elmode.engine.AlertLevel;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "telemetry_logs")
public class TelemetryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vehicleId;
    private String metric;
    private int metricValue;

    @Enumerated(EnumType.STRING)
    private AlertLevel status;

    private LocalDateTime timestamp;

    public TelemetryRecord() {}

    public TelemetryRecord(String vehicleId, String metric, int metricValue, AlertLevel status) {
        this.vehicleId = vehicleId;
        this.metric = metric;
        this.metricValue = metricValue;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getVehicleId() { return vehicleId; }
    public String getMetric() { return metric; }
    public int getMetricValue() { return metricValue; }
    public AlertLevel getStatus() { return status; }
    public LocalDateTime getTimestamp() { return timestamp; }
}