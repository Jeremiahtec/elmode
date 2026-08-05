package com.sqi.elmode.simulator;

import com.sqi.elmode.engine.HeuristicProcessor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class TelematicsSimulator {

    private final HeuristicProcessor processor;
    private final Random random = new Random();

    private int baseCoolantTempC = 90;
    private int baseRpm = 2000;
    private int cycleCount = 0;

    public TelematicsSimulator(HeuristicProcessor processor) {
        this.processor = processor;
    }

    @Scheduled(fixedRate = 2000)
    public void simulateEngineData() {
        cycleCount++;

        if (cycleCount % 10 == 0) {
            // Hill Climb Spike!
            baseCoolantTempC += 8;
            baseRpm += 2500;
            System.out.println("\n--- [ELMODE SIMULATOR] Steep incline detected. Load peaking. ---");
        } else {
            // Natural Recovery (Coast back to baseline)
            if (baseCoolantTempC > 90) baseCoolantTempC -= 2;
            if (baseRpm > 2000) baseRpm -= 400;

            // Minor road fluctuations
            baseCoolantTempC += random.nextInt(3) - 1;
            baseRpm += random.nextInt(300) - 150;
        }

        // Hard Mechanical Limits (Prevents the 22k RPM liftoff)
        if (baseCoolantTempC > 115) baseCoolantTempC = 115; // Max overheat
        if (baseRpm > 6500) baseRpm = 6500;                 // Redline
        if (baseCoolantTempC < 80) baseCoolantTempC = 80;   // Cold engine
        if (baseRpm < 800) baseRpm = 800;                   // Idle

        // 1. Broadcast Coolant
        int hexCoolantA = baseCoolantTempC + 40;
        String obdCoolantString = String.format("41 05 %02X", hexCoolantA);
        processor.processIncomingHex(obdCoolantString);

        // 2. Broadcast RPM
        int rpmCalculated = baseRpm * 4;
        int hexRpmA = rpmCalculated / 256;
        int hexRpmB = rpmCalculated % 256;
        String obdRpmString = String.format("41 0C %02X %02X", hexRpmA, hexRpmB);
        processor.processIncomingHex(obdRpmString);
    }
}