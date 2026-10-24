package com.parking.repository;

import com.parking.model.Vehicle;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public class VehicleRepository {

    private final JdbcTemplate jdbcTemplate;

    public VehicleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Vehicle> vehicleRowMapper = new RowMapper<Vehicle>() {
        @Override
        public Vehicle mapRow(ResultSet rs, int rowNum) throws SQLException {
            Vehicle vehicle = new Vehicle();
            vehicle.setId(rs.getInt("id"));
            vehicle.setVehicleNumber(rs.getString("vehicle_number"));
            vehicle.setVehicleType(rs.getString("vehicle_type"));
            vehicle.setOwnerName(rs.getString("owner_name"));
            vehicle.setSlotNumber(rs.getString("slot_number"));
            
            Timestamp entryTs = rs.getTimestamp("entry_time");
            if (entryTs != null) {
                vehicle.setEntryTime(entryTs.toLocalDateTime());
            }
            Timestamp exitTs = rs.getTimestamp("exit_time");
            if (exitTs != null) {
                vehicle.setExitTime(exitTs.toLocalDateTime());
            }
            vehicle.setFee(rs.getDouble("fee"));
            vehicle.setStatus(rs.getString("status"));
            return vehicle;
        }
    };

    public int save(Vehicle vehicle) {
        String sql = "INSERT INTO vehicles (vehicle_number, vehicle_type, owner_name, slot_number, entry_time, fee, status) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql,
                vehicle.getVehicleNumber(),
                vehicle.getVehicleType(),
                vehicle.getOwnerName(),
                vehicle.getSlotNumber(),
                vehicle.getEntryTime() != null ? Timestamp.valueOf(vehicle.getEntryTime()) : Timestamp.valueOf(java.time.LocalDateTime.now()),
                vehicle.getFee() != null ? vehicle.getFee() : 0.0,
                vehicle.getStatus() != null ? vehicle.getStatus() : "PARKED"
        );
    }

    public int updateExit(String vehicleNumber, java.time.LocalDateTime exitTime, double fee) {
        String sql = "UPDATE vehicles SET exit_time = ?, fee = ?, status = 'EXITED' WHERE vehicle_number = ? AND status = 'PARKED'";
        return jdbcTemplate.update(sql, Timestamp.valueOf(exitTime), fee, vehicleNumber);
    }

    public Optional<Vehicle> findParkedByVehicleNumber(String vehicleNumber) {
        String sql = "SELECT * FROM vehicles WHERE vehicle_number = ? AND status = 'PARKED'";
        List<Vehicle> list = jdbcTemplate.query(sql, vehicleRowMapper, vehicleNumber);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public List<Vehicle> findAllParked() {
        String sql = "SELECT * FROM vehicles WHERE status = 'PARKED' ORDER BY entry_time ASC";
        return jdbcTemplate.query(sql, vehicleRowMapper);
    }

    public int deleteParkedRecord(String vehicleNumber) {
        String sql = "DELETE FROM vehicles WHERE vehicle_number = ? AND status = 'PARKED'";
        return jdbcTemplate.update(sql, vehicleNumber);
    }
}
