package com.sqi.elmode.controller;

import com.sqi.elmode.model.TelemetryRecord;
import com.sqi.elmode.repository.TelemetryRepository;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/telemetry")
@CrossOrigin(origins = "http://localhost:3000")
public class TelemetryController {

    private final TelemetryRepository repository;

    public TelemetryController(TelemetryRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/history")
    public List<TelemetryRecord> getHistoricalLogs() {
        return repository.findTop15ByOrderByIdDesc();
    }

    @DeleteMapping("/reset")
    public void resetSystem() {
        repository.deleteAll();
        System.out.println("\n--- [MAINTENANCE] System reset triggered. Database cleared. ---");
    }
}