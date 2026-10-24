package com.parking.service;

import com.parking.model.ParkingHistory;
import com.parking.model.ParkingSlot;
import com.parking.model.Vehicle;
import com.parking.model.WaitingVehicle;
import com.parking.repository.ParkingHistoryRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.VehicleRepository;
import com.parking.repository.WaitingQueueRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ParkingService {

    private final VehicleRepository vehicleRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final WaitingQueueRepository waitingQueueRepository;
    private final ParkingHistoryRepository parkingHistoryRepository;

    // Explicit Data Structures required by system design:
    // 1. ArrayList for maintaining available parking slot numbers [1, 2, 3, ... 20]
    private final ArrayList<Integer> availableSlots = new ArrayList<>();

    // 2. HashMap for fast vehicle lookup by vehicleNumber
    private final HashMap<String, Vehicle> parkedVehicles = new HashMap<>();

    // 3. Queue (LinkedList) for FIFO waiting vehicles
    private final Queue<Vehicle> waitingQueue = new LinkedList<>();

    private static final int TOTAL_CAPACITY = 20;

    public ParkingService(VehicleRepository vehicleRepository,
                          ParkingSlotRepository parkingSlotRepository,
                          WaitingQueueRepository waitingQueueRepository,
                          ParkingHistoryRepository parkingHistoryRepository) {
        this.vehicleRepository = vehicleRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.waitingQueueRepository = waitingQueueRepository;
        this.parkingHistoryRepository = parkingHistoryRepository;
    }

    /**
     * Initializes data structures on startup from the MySQL database using JDBC.
     */
    @PostConstruct
    public synchronized void initialize() {
        availableSlots.clear();
        parkedVehicles.clear();
        waitingQueue.clear();

        // 1. Load all currently parked vehicles from database
        List<Vehicle> dbParked = vehicleRepository.findAllParked();
        Set<Integer> occupiedSlotNumbers = new HashSet<>();

        for (Vehicle v : dbParked) {
            parkedVehicles.put(v.getVehicleNumber().toUpperCase(), v);
            if (v.getSlotNumber() != null && v.getSlotNumber().startsWith("P")) {
                try {
                    int slotNum = Integer.parseInt(v.getSlotNumber().substring(1));
                    occupiedSlotNumbers.add(slotNum);
                } catch (NumberFormatException ignored) {}
            }
        }

        // 2. Populate availableSlots ArrayList with non-occupied slots (1 to 20)
        for (int i = 1; i <= TOTAL_CAPACITY; i++) {
            if (!occupiedSlotNumbers.contains(i)) {
                availableSlots.add(i);
            }
        }
        Collections.sort(availableSlots);

        // 3. Load waiting queue from database
        List<WaitingVehicle> dbQueue = waitingQueueRepository.findAll();
        for (WaitingVehicle wv : dbQueue) {
            Vehicle v = new Vehicle();
            v.setId(wv.getId());
            v.setVehicleNumber(wv.getVehicleNumber());
            v.setVehicleType(wv.getVehicleType());
            v.setOwnerName(wv.getOwnerName());
            v.setEntryTime(wv.getCreatedAt());
            waitingQueue.offer(v);
        }
    }

    /**
     * Vehicle Entry registration.
     */
    public synchronized Map<String, Object> registerVehicleEntry(String vehicleNumber, String vehicleType, String ownerName) {
        Map<String, Object> response = new HashMap<>();

        if (vehicleNumber == null || vehicleNumber.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Vehicle number is required");
            return response;
        }

        final String normalizedNumber = vehicleNumber.trim().toUpperCase();

        // Check if vehicle is already parked in HashMap
        if (parkedVehicles.containsKey(normalizedNumber)) {
            response.put("success", false);
            response.put("message", "Vehicle " + normalizedNumber + " is already parked in slot " + parkedVehicles.get(normalizedNumber).getSlotNumber());
            return response;
        }

        // Check if vehicle is already in the waiting queue
        for (Vehicle v : waitingQueue) {
            if (v.getVehicleNumber().equalsIgnoreCase(normalizedNumber)) {
                response.put("success", false);
                response.put("message", "Vehicle " + normalizedNumber + " is already in the waiting queue.");
                return response;
            }
        }

        LocalDateTime now = LocalDateTime.now();

        // Check if slots are available in ArrayList
        if (!availableSlots.isEmpty()) {
            // Allocate the first available slot (ArrayList removal)
            int slotId = availableSlots.remove(0);
            String slotNumber = String.format("P%02d", slotId);

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleNumber(normalizedNumber);
            vehicle.setVehicleType(vehicleType != null && !vehicleType.trim().isEmpty() ? vehicleType.trim() : "Car");
            vehicle.setOwnerName(ownerName != null && !ownerName.trim().isEmpty() ? ownerName.trim() : "Guest Owner");
            vehicle.setSlotNumber(slotNumber);
            vehicle.setEntryTime(now);
            vehicle.setFee(0.0);
            vehicle.setStatus("PARKED");

            // Store in HashMap for O(1) lookup
            parkedVehicles.put(normalizedNumber, vehicle);

            // Persist to MySQL via JDBC
            vehicleRepository.save(vehicle);
            parkingSlotRepository.updateSlotStatus(slotNumber, "OCCUPIED");

            response.put("success", true);
            response.put("status", "PARKED");
            response.put("message", "Vehicle parked successfully");
            response.put("vehicleNumber", normalizedNumber);
            response.put("vehicleType", vehicle.getVehicleType());
            response.put("ownerName", vehicle.getOwnerName());
            response.put("slotNumber", slotNumber);
            response.put("entryTime", now.toString());
            response.put("availableSlotsCount", availableSlots.size());
            return response;
        } else {
            // Parking full - Enqueue to waitingQueue (FIFO Queue)
            Vehicle waiting = new Vehicle();
            waiting.setVehicleNumber(normalizedNumber);
            waiting.setVehicleType(vehicleType != null && !vehicleType.trim().isEmpty() ? vehicleType.trim() : "Car");
            waiting.setOwnerName(ownerName != null && !ownerName.trim().isEmpty() ? ownerName.trim() : "Guest Owner");
            waiting.setEntryTime(now);

            waitingQueue.offer(waiting);

            // Persist to waiting_queue table in MySQL via JDBC
            WaitingVehicle wv = new WaitingVehicle();
            wv.setVehicleNumber(normalizedNumber);
            wv.setVehicleType(waiting.getVehicleType());
            wv.setOwnerName(waiting.getOwnerName());
            wv.setCreatedAt(now);
            waitingQueueRepository.enqueue(wv);

            int queuePosition = waitingQueue.size();

            response.put("success", true);
            response.put("status", "QUEUED");
            response.put("message", "Parking Full. Vehicle added to waiting queue.");
            response.put("vehicleNumber", normalizedNumber);
            response.put("vehicleType", waiting.getVehicleType());
            response.put("ownerName", waiting.getOwnerName());
            response.put("queuePosition", queuePosition);
            response.put("entryTime", now.toString());
            return response;
        }
    }

    /**
     * Vehicle Exit processing and fee calculation.
     */
    public synchronized Map<String, Object> processVehicleExit(String vehicleNumber) {
        Map<String, Object> response = new HashMap<>();

        if (vehicleNumber == null || vehicleNumber.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Vehicle number is required");
            return response;
        }

        final String normalizedNumber = vehicleNumber.trim().toUpperCase();

        // 1. Fast lookup in HashMap
        Vehicle vehicle = parkedVehicles.get(normalizedNumber);
        if (vehicle == null) {
            response.put("success", false);
            response.put("message", "Vehicle " + normalizedNumber + " is not currently parked.");
            return response;
        }

        // 2 & 3. Calculate duration
        LocalDateTime entryTime = vehicle.getEntryTime() != null ? vehicle.getEntryTime() : LocalDateTime.now().minusHours(1);
        LocalDateTime exitTime = LocalDateTime.now();

        Duration duration = Duration.between(entryTime, exitTime);
        long totalSeconds = Math.max(1, duration.getSeconds());
        double durationHours = Math.round((totalSeconds / 3600.0) * 100.0) / 100.0;
        if (durationHours < 0.05) {
            durationHours = 0.05; // minimum fractional display
        }

        // 4 & 5. Calculate parking fee
        // First hour = ₹30, Each additional hour = ₹20. Minimum fee = ₹30.
        // Partial hours rounded: 2.25 hours -> round(2.25) = 2 hrs -> ₹30 + (2-1)*20 = ₹50
        double roundedHours = Math.max(1, Math.round(durationHours));
        double fee = 30.0;
        if (roundedHours > 1) {
            fee += (roundedHours - 1) * 20.0;
        }

        String freedSlot = vehicle.getSlotNumber();

        // 6. Remove vehicle from HashMap
        parkedVehicles.remove(normalizedNumber);

        // 7. Update MySQL via JDBC
        vehicleRepository.updateExit(normalizedNumber, exitTime, fee);

        // 8. Save parking history via JDBC
        ParkingHistory history = new ParkingHistory();
        history.setVehicleNumber(normalizedNumber);
        history.setVehicleType(vehicle.getVehicleType());
        history.setSlotNumber(freedSlot);
        history.setEntryTime(entryTime);
        history.setExitTime(exitTime);
        history.setDurationHours(durationHours);
        history.setFee(fee);
        parkingHistoryRepository.save(history);

        // 9 & 10. Check Queue for waiting vehicles (FIFO)
        Map<String, Object> autoAllocatedVehicle = null;
        if (!waitingQueue.isEmpty()) {
            Vehicle nextVehicle = waitingQueue.poll();
            waitingQueueRepository.deleteByVehicleNumber(nextVehicle.getVehicleNumber());

            // Allocate the freed slot immediately to the next vehicle in queue
            nextVehicle.setSlotNumber(freedSlot);
            nextVehicle.setEntryTime(LocalDateTime.now());
            nextVehicle.setFee(0.0);
            nextVehicle.setStatus("PARKED");

            parkedVehicles.put(nextVehicle.getVehicleNumber().toUpperCase(), nextVehicle);
            vehicleRepository.save(nextVehicle);

            autoAllocatedVehicle = new HashMap<>();
            autoAllocatedVehicle.put("vehicleNumber", nextVehicle.getVehicleNumber());
            autoAllocatedVehicle.put("vehicleType", nextVehicle.getVehicleType());
            autoAllocatedVehicle.put("ownerName", nextVehicle.getOwnerName());
            autoAllocatedVehicle.put("slotNumber", freedSlot);
            autoAllocatedVehicle.put("allocatedTime", nextVehicle.getEntryTime().toString());
        } else {
            // Free the slot in ArrayList and update MySQL slot status
            try {
                int slotId = Integer.parseInt(freedSlot.substring(1));
                if (!availableSlots.contains(slotId)) {
                    availableSlots.add(slotId);
                    Collections.sort(availableSlots);
                }
            } catch (Exception ignored) {}
            parkingSlotRepository.updateSlotStatus(freedSlot, "AVAILABLE");
        }

        response.put("success", true);
        response.put("message", "Vehicle exited successfully");
        response.put("vehicleNumber", normalizedNumber);
        response.put("vehicleType", vehicle.getVehicleType());
        response.put("ownerName", vehicle.getOwnerName());
        response.put("slotNumber", freedSlot);
        response.put("entryTime", entryTime.toString());
        response.put("exitTime", exitTime.toString());
        response.put("durationHours", durationHours);
        response.put("fee", fee);
        response.put("autoAllocatedVehicle", autoAllocatedVehicle);
        response.put("availableSlotsCount", availableSlots.size());
        response.put("remainingQueueSize", waitingQueue.size());

        return response;
    }

    /**
     * Returns visual parking slots P01 - P20 with status and current vehicle details.
     */
    public synchronized List<Map<String, Object>> getAllParkingSlots() {
        List<Map<String, Object>> result = new ArrayList<>();
        Map<String, Vehicle> slotToVehicle = new HashMap<>();
        for (Vehicle v : parkedVehicles.values()) {
            if (v.getSlotNumber() != null) {
                slotToVehicle.put(v.getSlotNumber(), v);
            }
        }

        for (int i = 1; i <= TOTAL_CAPACITY; i++) {
            String slotNumber = String.format("P%02d", i);
            Map<String, Object> slotData = new HashMap<>();
            slotData.put("slotNumber", slotNumber);

            if (slotToVehicle.containsKey(slotNumber)) {
                Vehicle v = slotToVehicle.get(slotNumber);
                slotData.put("status", "OCCUPIED");
                slotData.put("vehicleNumber", v.getVehicleNumber());
                slotData.put("vehicleType", v.getVehicleType());
                slotData.put("ownerName", v.getOwnerName());
                slotData.put("entryTime", v.getEntryTime() != null ? v.getEntryTime().toString() : "");
            } else {
                slotData.put("status", "AVAILABLE");
                slotData.put("vehicleNumber", null);
                slotData.put("vehicleType", null);
                slotData.put("ownerName", null);
                slotData.put("entryTime", null);
            }
            result.add(slotData);
        }
        return result;
    }

    /**
     * Get all currently parked vehicles.
     */
    public synchronized List<Vehicle> getAllParkedVehicles() {
        return new ArrayList<>(parkedVehicles.values());
    }

    /**
     * Get a specific vehicle by vehicleNumber.
     */
    public synchronized Optional<Vehicle> getVehicle(String vehicleNumber) {
        if (vehicleNumber == null) return Optional.empty();
        return Optional.ofNullable(parkedVehicles.get(vehicleNumber.trim().toUpperCase()));
    }

    /**
     * Get waiting queue list with positions (FIFO).
     */
    public synchronized List<Map<String, Object>> getWaitingQueue() {
        List<Map<String, Object>> queueList = new ArrayList<>();
        int pos = 1;
        for (Vehicle v : waitingQueue) {
            Map<String, Object> item = new HashMap<>();
            item.put("position", pos++);
            item.put("vehicleNumber", v.getVehicleNumber());
            item.put("vehicleType", v.getVehicleType());
            item.put("ownerName", v.getOwnerName());
            item.put("entryTime", v.getEntryTime() != null ? v.getEntryTime().toString() : LocalDateTime.now().toString());
            queueList.add(item);
        }
        return queueList;
    }

    /**
     * Get parking history records.
     */
    public List<ParkingHistory> getParkingHistory() {
        return parkingHistoryRepository.findAll();
    }

    /**
     * Dashboard statistics calculated from real backend data structures and JDBC.
     */
    public synchronized Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        int occupied = parkedVehicles.size();
        int available = availableSlots.size();
        int waiting = waitingQueue.size();
        double todayRevenue = parkingHistoryRepository.getTodayRevenue();
        int totalHistory = parkingHistoryRepository.getTotalHistoryCount();

        stats.put("totalSlots", TOTAL_CAPACITY);
        stats.put("availableSlots", available);
        stats.put("occupiedSlots", occupied);
        stats.put("waitingVehicles", waiting);
        stats.put("todayRevenue", todayRevenue);
        stats.put("totalHistoryCount", totalHistory);

        // Data structures diagnostic info for college viva demonstration
        stats.put("dataStructures", Map.of(
            "availableSlotsList", new ArrayList<>(availableSlots),
            "parkedVehiclesKeys", new ArrayList<>(parkedVehicles.keySet()),
            "queueSize", waitingQueue.size()
        ));

        return stats;
    }

    /**
     * Reset / Seed initial demonstration state if needed.
     */
    public synchronized void resetDemoData() {
        availableSlots.clear();
        for (int i = 1; i <= TOTAL_CAPACITY; i++) {
            availableSlots.add(i);
        }
        parkedVehicles.clear();
        waitingQueue.clear();
        parkingSlotRepository.resetAllSlots();
    }
}
