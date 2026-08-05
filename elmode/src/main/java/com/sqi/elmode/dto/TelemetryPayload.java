package com.sqi.elmode.dto;

import com.sqi.elmode.engine.AlertLevel;

public class TelemetryPayload {
    private String vehicleId;
    private String metric;
    private int value;
    private AlertLevel status;

    public TelemetryPayload(String vehicleId, String metric, int value, AlertLevel status) {
        this.vehicleId = vehicleId;
        this.metric = metric;
        this.value = value;
        this.status = status;
    }

    public String getVehicleId() { return vehicleId; }
    public String getMetric() { return metric; }
    public int getValue() { return value; }
    public AlertLevel getStatus() { return status; }
}