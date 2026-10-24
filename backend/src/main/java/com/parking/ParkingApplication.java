package com.parking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ParkingApplication {

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("🚗 SMART PARKING MANAGEMENT SYSTEM - JAVA SPRING BOOT");
        System.out.println("Data Structures: Queue (FIFO), HashMap (O(1)), ArrayList");
        System.out.println("Database: MySQL via JDBC Template");
        System.out.println("Server running on: http://localhost:8080");
        System.out.println("==================================================");
        SpringApplication.run(ParkingApplication.java, args);
    }
}
