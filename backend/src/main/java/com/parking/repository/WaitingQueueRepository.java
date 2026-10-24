package com.parking.repository;

import com.parking.model.WaitingVehicle;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

@Repository
public class WaitingQueueRepository {

    private final JdbcTemplate jdbcTemplate;

    public WaitingQueueRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<WaitingVehicle> queueRowMapper = new RowMapper<WaitingVehicle>() {
        @Override
        public WaitingVehicle mapRow(ResultSet rs, int rowNum) throws SQLException {
            WaitingVehicle wv = new WaitingVehicle();
            wv.setId(rs.getInt("id"));
            wv.setVehicleNumber(rs.getString("vehicle_number"));
            wv.setVehicleType(rs.getString("vehicle_type"));
            wv.setOwnerName(rs.getString("owner_name"));
            Timestamp created = rs.getTimestamp("created_at");
            if (created != null) {
                wv.setCreatedAt(created.toLocalDateTime());
            }
            wv.setPosition(rowNum + 1);
            return wv;
        }
    };

    public int enqueue(WaitingVehicle vehicle) {
        String sql = "INSERT INTO waiting_queue (vehicle_number, vehicle_type, owner_name, created_at) VALUES (?, ?, ?, ?)";
        return jdbcTemplate.update(sql,
                vehicle.getVehicleNumber(),
                vehicle.getVehicleType(),
                vehicle.getOwnerName(),
                vehicle.getCreatedAt() != null ? Timestamp.valueOf(vehicle.getCreatedAt()) : Timestamp.valueOf(java.time.LocalDateTime.now())
        );
    }

    public List<WaitingVehicle> findAll() {
        String sql = "SELECT * FROM waiting_queue ORDER BY created_at ASC, id ASC";
        return jdbcTemplate.query(sql, queueRowMapper);
    }

    public int deleteById(int id) {
        String sql = "DELETE FROM waiting_queue WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    public int deleteByVehicleNumber(String vehicleNumber) {
        String sql = "DELETE FROM waiting_queue WHERE vehicle_number = ?";
        return jdbcTemplate.update(sql, vehicleNumber);
    }
}
