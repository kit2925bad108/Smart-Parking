package com.parking.model;

public class ParkingSlot {
    private String slotNumber;
    private String status; // AVAILABLE, OCCUPIED
    private Vehicle currentVehicle;

    public ParkingSlot() {
    }

    public ParkingSlot(String slotNumber, String status) {
        this.slotNumber = slotNumber;
        this.status = status;
    }

    public ParkingSlot(String slotNumber, String status, Vehicle currentVehicle) {
        this.slotNumber = slotNumber;
        this.status = status;
        this.currentVehicle = currentVehicle;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Vehicle getCurrentVehicle() {
        return currentVehicle;
    }

    public void setCurrentVehicle(Vehicle currentVehicle) {
        this.currentVehicle = currentVehicle;
    }
}
