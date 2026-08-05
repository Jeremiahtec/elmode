package com.sqi.elmode.engine;

import org.springframework.stereotype.Component;

@Component
public class RpmRule implements DiagnosticRule {

    @Override
    public String getMetricName() {
        return "ENGINE_RPM";
    }

    @Override
    public AlertLevel evaluate(int rpm) {
        if (rpm > 6500) {
            return AlertLevel.CRITICAL; // Redline limits
        } else if (rpm >= 5000) {
            return AlertLevel.WARNING;  // High stress
        } else {
            return AlertLevel.INFO;     // Normal operation
        }
    }
}