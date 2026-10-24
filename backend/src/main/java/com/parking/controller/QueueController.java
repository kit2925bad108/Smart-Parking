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
@RequestMapping("/api/queue")
@CrossOrigin(origins = "*")
public class QueueController {

    private final ParkingService parkingService;

    public QueueController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    /**
     * GET /api/queue
     * Returns FIFO waiting queue list with position and vehicle details.
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getWaitingQueue() {
        return ResponseEntity.ok(parkingService.getWaitingQueue());
    }
}
