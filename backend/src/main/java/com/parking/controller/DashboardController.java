package com.parking.controller;

import com.parking.model.ParkingHistory;
import com.parking.service.ParkingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final ParkingService parkingService;

    public DashboardController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    /**
     * GET /api/dashboard
     * Returns total slots, available slots, occupied slots, waiting count, today's revenue.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(parkingService.getDashboardStats());
    }

    /**
     * GET /api/history
     * Returns parking history records.
     */
    @GetMapping("/history")
    public ResponseEntity<List<ParkingHistory>> getHistory() {
        return ResponseEntity.ok(parkingService.getParkingHistory());
    }

    /**
     * POST /api/reset
     * Resets demo data for testing.
     */
    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetData() {
        parkingService.resetDemoData();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Parking data reset successfully"
        ));
    }
}
