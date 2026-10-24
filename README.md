# 🚗 Smart Parking Management System

A full-stack, enterprise-grade Smart Parking Management System with a modern web dashboard and a Java Spring Boot backend utilizing JDBC, MySQL, and core Java Data Structures (`ArrayList`, `HashMap`, `Queue`).

---

## 📌 1. Project Overview

The Smart Parking Management System automates vehicle parking allocation, real-time slot occupancy tracking, waiting list management (FIFO), vehicle exit fee calculations, and transaction history.

### Core Data Structure Architecture:
* **`ArrayList<Integer> availableSlots`**: Maintains free slot numbers `[1, 2, ..., 20]`. When a vehicle enters, `availableSlots.remove(0)` allocates the first available slot. When a vehicle exits without waiting queue, the freed slot number is added back and sorted.
* **`HashMap<String, Vehicle> parkedVehicles`**: Stores currently parked vehicles indexed by uppercase vehicle number (e.g., `"TN38AB1234" -> Vehicle`). Provides instantaneous $O(1)$ lookup for vehicle verification and exit processing.
* **`Queue<Vehicle> waitingQueue = new LinkedList<>()`**: Implements First-In-First-Out (FIFO) queue for arriving vehicles when all 20 slots (`P01` to `P20`) are occupied. When any vehicle exits, the first waiting vehicle automatically receives the freed parking slot.
* **JDBC (`JdbcTemplate`) & MySQL**: Pure relational persistence with parameterized SQL queries, avoiding ORM/JPA overhead.

---

## 🛠 2. Technologies Used

### Backend
* **Language:** Java 17+
* **Framework:** Spring Boot 3.2.x (`spring-boot-starter-web`, `spring-boot-starter-jdbc`)
* **Persistence:** JDBC / Spring `JdbcTemplate` (No JPA/Hibernate)
* **Database:** MySQL 8.0 (`parking_db`)
* **Driver:** `mysql-connector-j`
* **Build Tool:** Apache Maven

### Frontend & Live Preview
* **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Fetch API
* **Full-Stack Live Dev Engine:** Node.js Express server + Vite mounted middleware running on port 3000

---

## 🏗 3. System Architecture & Flow

```text
┌─────────────────┐       HTTP JSON       ┌──────────────────────┐
│  Web Dashboard  │ ◄───────────────────► │  Spring Boot API     │
│  (React / Vite) │                       │  (Controller Layer)  │
└─────────────────┘                       └──────────┬───────────┘
                                                     │
                                                     ▼
                                          ┌──────────────────────┐
                                          │   ParkingService     │
                                          │ ──────────────────── │
                                          │ • ArrayList (Slots)  │
                                          │ • HashMap (Vehicles) │
                                          │ • Queue (Waiting)    │
                                          └──────────┬───────────┘
                                                     │
                                                     ▼
                                          ┌──────────────────────┐
                                          │   JDBC Repository    │
                                          │  (Parameterized SQL) │
                                          └──────────┬───────────┘
                                                     │
                                                     ▼
                                          ┌──────────────────────┐
                                          │     MySQL RDBMS      │
                                          │    (parking_db)      │
                                          └──────────────────────┘
```

---

## 🗄 4. MySQL Database Setup

### Step 1: Log in to MySQL
```bash
mysql -u root -p
```

### Step 2: Create Database
```sql
CREATE DATABASE IF NOT EXISTS parking_db;
USE parking_db;
```

### Step 3: Run DDL Queries
```sql
-- 1. Vehicles table
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

-- 2. Parking slots table
CREATE TABLE IF NOT EXISTS parking_slots (
    slot_number VARCHAR(10) PRIMARY KEY,
    status VARCHAR(20) NOT NULL
);

-- 3. Waiting queue table
CREATE TABLE IF NOT EXISTS waiting_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_number VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(30),
    owner_name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Parking history table
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

-- 5. Seed Initial 20 Slots (P01 - P20)
INSERT IGNORE INTO parking_slots (slot_number, status) VALUES
('P01', 'AVAILABLE'), ('P02', 'AVAILABLE'), ('P03', 'AVAILABLE'), ('P04', 'AVAILABLE'), ('P05', 'AVAILABLE'),
('P06', 'AVAILABLE'), ('P07', 'AVAILABLE'), ('P08', 'AVAILABLE'), ('P09', 'AVAILABLE'), ('P10', 'AVAILABLE'),
('P11', 'AVAILABLE'), ('P12', 'AVAILABLE'), ('P13', 'AVAILABLE'), ('P14', 'AVAILABLE'), ('P15', 'AVAILABLE'),
('P16', 'AVAILABLE'), ('P17', 'AVAILABLE'), ('P18', 'AVAILABLE'), ('P19', 'AVAILABLE'), ('P20', 'AVAILABLE');
```

---

## 🚀 5. How to Run the Java Spring Boot Backend

### Prerequisites:
- Java JDK 17 or higher
- Apache Maven 3.8+
- MySQL Server 8.0+

### Steps:
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Verify or update `src/main/resources/application.properties` credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/parking_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   server.port=8080
   ```
3. Build and run with Maven:
   ```bash
   mvn clean spring-boot:run
   ```
4. Backend will start at: `http://localhost:8080`

---

## 🌐 6. How to Run the Frontend

1. In the root directory:
   ```bash
   npm install
   npm run dev
   ```
2. Open `http://localhost:3000` in your web browser.
3. The frontend includes a live toggle to point to either the internal full-stack runtime or your local Spring Boot backend (`http://localhost:8080/api`).

---

## 📡 7. REST API Documentation

Base URL: `http://localhost:8080/api` (or `/api` on dev server)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/vehicles/entry` | `POST` | Registers vehicle entry. Allocates slot or queues if full. |
| `/api/vehicles/exit` | `POST` | Processes vehicle exit, computes fee, auto-allocates to queue. |
| `/api/vehicles` | `GET` | Retrieves all currently parked vehicles. |
| `/api/vehicles/{vNum}`| `GET` | Retrieves specific vehicle details. |
| `/api/slots` | `GET` | Retrieves status and vehicles for slots `P01` to `P20`. |
| `/api/queue` | `GET` | Retrieves the FIFO waiting queue with positions. |
| `/api/history` | `GET` | Retrieves past parking transactions with fees. |
| `/api/dashboard` | `GET` | Retrieves real-time counters and statistics. |
| `/api/reset` | `POST` | Resets system state back to clean initial demo data. |

### API Request & Response Examples:

#### 1. Vehicle Entry (`POST /api/vehicles/entry`)
```json
{
  "vehicleNumber": "TN38AB1234",
  "vehicleType": "Car",
  "ownerName": "Muthukrishnan"
}
```
*Slot Available Response:*
```json
{
  "success": true,
  "status": "PARKED",
  "message": "Vehicle parked successfully",
  "vehicleNumber": "TN38AB1234",
  "vehicleType": "Car",
  "ownerName": "Muthukrishnan",
  "slotNumber": "P01",
  "entryTime": "2026-09-29T10:30:00"
}
```
*Parking Full Response (Added to Queue):*
```json
{
  "success": true,
  "status": "QUEUED",
  "message": "Parking Full. Vehicle added to waiting queue.",
  "vehicleNumber": "TN38AB1234",
  "queuePosition": 1
}
```

#### 2. Vehicle Exit (`POST /api/vehicles/exit`)
```json
{
  "vehicleNumber": "TN38AB1234"
}
```
*Response:*
```json
{
  "success": true,
  "message": "Vehicle exited successfully",
  "vehicleNumber": "TN38AB1234",
  "slotNumber": "P01",
  "entryTime": "2026-09-29T10:30:00",
  "exitTime": "2026-09-29T12:45:00",
  "durationHours": 2.25,
  "fee": 50,
  "autoAllocatedVehicle": null
}
```

---

## 💰 8. Fee Calculation Rules

* **First 1 Hour:** Flat fee of ₹30 (Minimum fee).
* **Each Additional Hour:** ₹20 per hour.
* **Formula:** `Fee = ₹30 + (Billed_Hours - 1) * ₹20`
* **Examples:**
  * 0.5 hours $\rightarrow$ 1 hr billed $\rightarrow$ ₹30
  * 1.0 hours $\rightarrow$ 1 hr billed $\rightarrow$ ₹30
  * 2.0 hours $\rightarrow$ 2 hrs billed $\rightarrow$ ₹50
  * 2.25 hours $\rightarrow$ rounded to 2 hrs $\rightarrow$ ₹50
  * 3.0 hours $\rightarrow$ 3 hrs billed $\rightarrow$ ₹70
  * 4.0 hours $\rightarrow$ 4 hrs billed $\rightarrow$ ₹90

---

## 🧪 9. Complete Testing Scenario (College Evaluation)

1. **Check Dashboard:** Observe Initial 20 Total Slots, Available Slots count, and Occupied count.
2. **Vehicle Entry:** Go to **Vehicle Entry**, enter vehicle number `TN38AB1234`, Type `Car`, Owner `Muthukrishnan`. Click **PARK VEHICLE**.
3. **Slot Allocation:** Confirm slot `P01` is allocated and message displays green.
4. **Visual Slots Check:** Navigate to **Parking Slots**; slot `P01` is red (OCCUPIED). Click on it to view occupant details.
5. **Fill All 20 Slots:** Use the **Simulate Full Parking (20 Slots)** quick-action button in the dashboard or enter 20 vehicles.
6. **Queue Demonstration:** Enter one more vehicle `TN99ZZ0001`. A warning dialog announces *Parking Full* and assigns **Queue Position 1**.
7. **Verify Waiting Queue:** Navigate to **Waiting Queue** tab to confirm FIFO listing.
8. **Vehicle Exit:** Go to **Vehicle Exit**, enter an occupied vehicle (e.g., `TN38AB1234`) and click **PROCESS EXIT**.
9. **Automated Queue Promotion:** Notice the fee calculation modal (e.g. ₹50) AND an alert stating that slot was automatically transferred to `TN99ZZ0001`!
10. **Parking History:** Navigate to **Parking History**; verify the completed transaction, entry/exit timestamp, duration, and fee.
11. **Browser Refresh:** Refresh the browser; all persistent data remains intact!

---

## 🎓 10. College Viva & Technical Explanation

### 1. Why `Queue`?
> "We used `java.util.Queue` (implemented with `LinkedList`) to maintain a strict First-In-First-Out (FIFO) waiting list when the parking lot reaches maximum capacity (20 slots). Arriving vehicles are enqueued via `.offer()`. When any occupied slot is freed, `.poll()` retrieves the vehicle that has been waiting the longest, ensuring fairness."

### 2. Why `HashMap`?
> "We used `java.util.HashMap<String, Vehicle>` keyed by uppercase vehicle number. Vehicle exit is a frequent operation; searching a linear list of 20 or 2,000 slots takes $O(n)$ time. With HashMap, lookup by registration number is $O(1)$ constant time, providing near-instantaneous checkout and fee calculation."

### 3. Why `ArrayList`?
> "We used `java.util.ArrayList<Integer>` to manage the pool of available parking slot IDs `[1, 2, ..., 20]`. When allocating, we take the lowest slot number `availableSlots.remove(0)`. When a slot is freed, it is appended back and sorted (`Collections.sort()`)."

### 4. Why JDBC instead of Hibernate/JPA?
> "JDBC with `JdbcTemplate` provides total control over SQL queries, eliminates ORM caching anomalies, avoids heavy Hibernate overhead, and guarantees parameterized queries to defend against SQL Injection."

---

## 📁 11. Project Directory Structure

```text
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── resources/
│       │   ├── application.properties
│       │   └── schema.sql
│       └── java/com/parking/
│           ├── ParkingApplication.java
│           ├── config/
│           │   └── CorsConfig.java
│           ├── model/
│           │   ├── Vehicle.java
│           │   ├── ParkingSlot.java
│           │   ├── WaitingVehicle.java
│           │   └── ParkingHistory.java
│           ├── repository/
│           │   ├── VehicleRepository.java
│           │   ├── ParkingSlotRepository.java
│           │   ├── WaitingQueueRepository.java
│           │   └── ParkingHistoryRepository.java
│           ├── service/
│           │   └── ParkingService.java
│           └── controller/
│               ├── VehicleController.java
│               ├── ParkingSlotController.java
│               ├── QueueController.java
│               └── DashboardController.java
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── components/
├── server.ts
├── package.json
└── README.md
```
