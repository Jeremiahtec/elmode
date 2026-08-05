package com.sqi.elmode.engine;

import com.sqi.elmode.dto.TelemetryPayload;
import com.sqi.elmode.repository.TelemetryRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class PredictiveEngine {

    private final TelemetryRepository repository;
    private final SimpMessagingTemplate messagingTemplate;

    public PredictiveEngine(TelemetryRepository repository, SimpMessagingTemplate messagingTemplate) {
        this.repository = repository;
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedRate = 10000)
    public void calculateRemainingUsefulLife() {
        String vehicleId = "VX-092";
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);

        long warningCount = repository.countRecentAlerts(vehicleId, AlertLevel.WARNING, fiveMinutesAgo);
        long criticalCount = repository.countRecentAlerts(vehicleId, AlertLevel.CRITICAL, fiveMinutesAgo);

        int healthScore = 100;

        healthScore -= (warningCount * 2);
        healthScore -= (criticalCount * 5);

        if (healthScore < 0) healthScore = 0;

        AlertLevel predictiveStatus = AlertLevel.INFO;
        if (healthScore <= 40) {
            predictiveStatus = AlertLevel.CRITICAL;
        } else if (healthScore <= 75) {
            predictiveStatus = AlertLevel.WARNING;
        }

        System.out.println("--- [PREDICTIVE ENGINE] VX-092 Overall Health: " + healthScore + "% ---");

        TelemetryPayload healthPayload = new TelemetryPayload(vehicleId, "ENGINE_HEALTH_RUL", healthScore, predictiveStatus);
        messagingTemplate.convertAndSend("/topic/telemetry", healthPayload);
    }
}