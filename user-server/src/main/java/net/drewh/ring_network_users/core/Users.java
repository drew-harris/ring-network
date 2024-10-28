package net.drewh.ring_network_users.core;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.zaxxer.hikari.HikariDataSource;

import net.drewh.ring_network_users.model.User;

public class Users {
    private final HikariDataSource dataSource;

    public Users(HikariDataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<User> findAll() {
        List<User> users = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users")) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                users.add(mapUser(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return users;
    }

    private User mapUser(ResultSet rs) throws SQLException {
        return new User(
            rs.getString("userId"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("type")
        );
    }
}
