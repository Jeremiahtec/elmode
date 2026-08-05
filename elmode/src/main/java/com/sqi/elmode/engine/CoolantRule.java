package com.sqi.elmode.engine;

import org.springframework.stereotype.Component;

@Component
public class CoolantRule implements DiagnosticRule {

    @Override
    public String getMetricName() {
        return "COOLANT_TEMP";
    }

    @Override
    public AlertLevel evaluate(int temperatureCelsius) {
        if (temperatureCelsius > 110) {
            return AlertLevel.CRITICAL;
        } else if (temperatureCelsius >= 96) {
            return AlertLevel.WARNING;
        } else {
            return AlertLevel.INFO;
        }
    }
}