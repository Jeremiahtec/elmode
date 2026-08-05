package com.sqi.elmode.engine;

import com.sqi.elmode.dto.TelemetryPayload;
import com.sqi.elmode.model.TelemetryRecord;
import com.sqi.elmode.repository.TelemetryRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HeuristicProcessor {

    private final List<DiagnosticRule> rules;
    private final SimpMessagingTemplate messagingTemplate;
    private final TelemetryRepository repository; // 1. Add the Database Repository

    // 2. Inject it via the constructor
    public HeuristicProcessor(List<DiagnosticRule> rules, SimpMessagingTemplate messagingTemplate, TelemetryRepository repository) {
        this.rules = rules;
        this.messagingTemplate = messagingTemplate;
        this.repository = repository;
    }

    public void processIncomingHex(String hexPayload) {
        if (hexPayload.startsWith("41 05")) {
            String hexValue = hexPayload.substring(6).trim();
            int realTempCelsius = Integer.parseInt(hexValue, 16) - 40;
            evaluateAndRoute("VX-092", "COOLANT_TEMP", realTempCelsius);
        }
        else if (hexPayload.startsWith("41 0C")) {
            String[] parts = hexPayload.substring(6).trim().split(" ");
            int realRpm = ((Integer.parseInt(parts[0], 16) * 256) + Integer.parseInt(parts[1], 16)) / 4;
            evaluateAndRoute("VX-092", "ENGINE_RPM", realRpm);
        }
    }

    // Clean helper method to handle evaluation, saving, and broadcasting
    private void evaluateAndRoute(String vehicleId, String metricName, int value) {
        for (DiagnosticRule rule : rules) {
            if (rule.getMetricName().equals(metricName)) {
                AlertLevel status = rule.evaluate(value);

                // A. Save to PostgreSQL Database
                TelemetryRecord record = new TelemetryRecord(vehicleId, metricName, value, status);
                repository.save(record);

                // B. Broadcast to Next.js Frontend
                TelemetryPayload payload = new TelemetryPayload(vehicleId, metricName, value, status);
                messagingTemplate.convertAndSend("/topic/telemetry", payload);
            }
        }
    }
}