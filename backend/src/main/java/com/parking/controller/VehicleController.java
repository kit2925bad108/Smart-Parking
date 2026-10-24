package com.parking.controller;

import com.parking.model.Vehicle;
import com.parking.service.ParkingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {

    private final ParkingService parkingService;

    public VehicleController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    /**
     * POST /api/vehicles/entry
     * Registers a new vehicle into the parking system.
     */
    @PostMapping("/entry")
    public ResponseEntity<Map<String, Object>> registerEntry(@RequestBody Map<String, String> request) {
        String vehicleNumber = request.get("vehicleNumber");
        String vehicleType = request.get("vehicleType");
        String ownerName = request.get("ownerName");

        if (vehicleNumber == null || vehicleNumber.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Vehicle number is required."
            ));
        }

        Map<String, Object> result = parkingService.registerVehicleEntry(vehicleNumber, vehicleType, ownerName);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        if (!success) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(result);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/vehicles/exit
     * Processes vehicle exit and calculates parking fee.
     */
    @PostMapping("/exit")
    public ResponseEntity<Map<String, Object>> processExit(@RequestBody Map<String, String> request) {
        String vehicleNumber = request.get("vehicleNumber");

        if (vehicleNumber == null || vehicleNumber.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Vehicle number is required."
            ));
        }

        Map<String, Object> result = parkingService.processVehicleExit(vehicleNumber);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        if (!success) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/vehicles
     * Returns all currently parked vehicles.
     */
    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllParkedVehicles() {
        return ResponseEntity.ok(parkingService.getAllParkedVehicles());
    }

    /**
     * GET /api/vehicles/{vehicleNumber}
     * Returns details of a specific parked vehicle.
     */
    @GetMapping("/{vehicleNumber}")
    public ResponseEntity<?> getVehicleByNumber(@PathVariable String vehicleNumber) {
        Optional<Vehicle> vehicle = parkingService.getVehicle(vehicleNumber);
        if (vehicle.isPresent()) {
            return ResponseEntity.ok(vehicle.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", "Vehicle " + vehicleNumber + " not found in parked list."
        ));
    }
}
