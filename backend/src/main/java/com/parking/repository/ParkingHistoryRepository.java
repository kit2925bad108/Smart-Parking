package com.parking.repository;

import com.parking.model.ParkingHistory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

@Repository
public class ParkingHistoryRepository {

    private final JdbcTemplate jdbcTemplate;

    public ParkingHistoryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<ParkingHistory> historyRowMapper = new RowMapper<ParkingHistory>() {
        @Override
        public ParkingHistory mapRow(ResultSet rs, int rowNum) throws SQLException {
            ParkingHistory ph = new ParkingHistory();
            ph.setId(rs.getInt("id"));
            ph.setVehicleNumber(rs.getString("vehicle_number"));
            ph.setVehicleType(rs.getString("vehicle_type"));
            ph.setSlotNumber(rs.getString("slot_number"));
            Timestamp entry = rs.getTimestamp("entry_time");
            if (entry != null) {
                ph.setEntryTime(entry.toLocalDateTime());
            }
            Timestamp exit = rs.getTimestamp("exit_time");
            if (exit != null) {
                ph.setExitTime(exit.toLocalDateTime());
            }
            ph.setDurationHours(rs.getDouble("duration_hours"));
            ph.setFee(rs.getDouble("fee"));
            return ph;
        }
    };

    public int save(ParkingHistory history) {
        String sql = "INSERT INTO parking_history (vehicle_number, vehicle_type, slot_number, entry_time, exit_time, duration_hours, fee) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql,
                history.getVehicleNumber(),
                history.getVehicleType(),
                history.getSlotNumber(),
                history.getEntryTime() != null ? Timestamp.valueOf(history.getEntryTime()) : Timestamp.valueOf(java.time.LocalDateTime.now()),
                history.getExitTime() != null ? Timestamp.valueOf(history.getExitTime()) : Timestamp.valueOf(java.time.LocalDateTime.now()),
                history.getDurationHours(),
                history.getFee()
        );
    }

    public List<ParkingHistory> findAll() {
        String sql = "SELECT * FROM parking_history ORDER BY exit_time DESC, id DESC";
        return jdbcTemplate.query(sql, historyRowMapper);
    }

    public double getTodayRevenue() {
        String sql = "SELECT COALESCE(SUM(fee), 0) FROM parking_history WHERE DATE(exit_time) = CURRENT_DATE";
        Double rev = jdbcTemplate.queryForObject(sql, Double.class);
        return rev != null ? rev : 0.0;
    }

    public int getTotalHistoryCount() {
        String sql = "SELECT COUNT(*) FROM parking_history";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
        return count != null ? count : 0;
    }
}
