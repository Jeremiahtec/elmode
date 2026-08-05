package com.sqi.elmode.engine;

public interface DiagnosticRule {
    String getMetricName();
    AlertLevel evaluate(int metricValue);
}