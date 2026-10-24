package com.parking.controller;

import com.parking.service.ParkingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin(origins = "*")
public class ParkingSlotController {

    private final ParkingService parkingService;

    public ParkingSlotController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    /**
     * GET /api/slots
     * Returns the 20 parking slots (P01 - P20) with current status and vehicle info.
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getSlots() {
        return ResponseEntity.ok(parkingService.getAllParkingSlots());
    }
}
