package com.parking.repository;

import com.parking.model.ParkingSlot;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class ParkingSlotRepository {

    private final JdbcTemplate jdbcTemplate;

    public ParkingSlotRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<ParkingSlot> slotRowMapper = new RowMapper<ParkingSlot>() {
        @Override
        public ParkingSlot mapRow(ResultSet rs, int rowNum) throws SQLException {
            ParkingSlot slot = new ParkingSlot();
            slot.setSlotNumber(rs.getString("slot_number"));
            slot.setStatus(rs.getString("status"));
            return slot;
        }
    };

    public List<ParkingSlot> findAllSlots() {
        String sql = "SELECT * FROM parking_slots ORDER BY slot_number ASC";
        return jdbcTemplate.query(sql, slotRowMapper);
    }

    public int updateSlotStatus(String slotNumber, String status) {
        String sql = "UPDATE parking_slots SET status = ? WHERE slot_number = ?";
        return jdbcTemplate.update(sql, status, slotNumber);
    }

    public int resetAllSlots() {
        String sql = "UPDATE parking_slots SET status = 'AVAILABLE'";
        return jdbcTemplate.update(sql);
    }
}
