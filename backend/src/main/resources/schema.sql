-- Smart Parking Management System Schema (MySQL)
-- Database: parking_db

CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL,
    owner_name VARCHAR(100),
    slot_number VARCHAR(10),
    entry_time DATETIME,
    exit_time DATETIME,
    fee DOUBLE DEFAULT 0,
    status VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS parking_slots (
    slot_number VARCHAR(10) PRIMARY KEY,
    status VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS waiting_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(30),
    owner_name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parking_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(20),
    vehicle_type VARCHAR(30),
    slot_number VARCHAR(10),
    entry_time DATETIME,
    exit_time DATETIME,
    duration_hours DOUBLE,
    fee DOUBLE
);

-- Seed initial 20 parking slots (P01 - P20) as AVAILABLE
INSERT IGNORE INTO parking_slots (slot_number, status) VALUES
('P01', 'AVAILABLE'),
('P02', 'AVAILABLE'),
('P03', 'AVAILABLE'),
('P04', 'AVAILABLE'),
('P05', 'AVAILABLE'),
('P06', 'AVAILABLE'),
('P07', 'AVAILABLE'),
('P08', 'AVAILABLE'),
('P09', 'AVAILABLE'),
('P10', 'AVAILABLE'),
('P11', 'AVAILABLE'),
('P12', 'AVAILABLE'),
('P13', 'AVAILABLE'),
('P14', 'AVAILABLE'),
('P15', 'AVAILABLE'),
('P16', 'AVAILABLE'),
('P17', 'AVAILABLE'),
('P18', 'AVAILABLE'),
('P19', 'AVAILABLE'),
('P20', 'AVAILABLE');
