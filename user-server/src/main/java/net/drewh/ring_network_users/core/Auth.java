package net.drewh.ring_network_users.core;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import com.zaxxer.hikari.HikariDataSource;

import net.drewh.ring_network_users.model.AuthPair;

public class Auth {
    private final HikariDataSource dataSource;

    public Auth(HikariDataSource dataSource) {
        this.dataSource = dataSource;
    }

    public AuthPair getAuthPairByUserId(String userId) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE userId = ?")) {
            stmt.setString(1, userId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return new AuthPair(userId, rs.getString("password"));
            } else {
                return null;
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

    }

    public void updatePassword(String userId, String password) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO users (userId, password) VALUES (?, ?) ON DUPLICATE KEY UPDATE password = ?")) {
            stmt.setString(1, userId);
            stmt.setString(2, password);
            stmt.setString(3, password);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteUser(String userId) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM users WHERE userId = ?")) {
            stmt.setString(1, userId);
            stmt.executeUpdate();

            PreparedStatement authStmt = conn.prepareStatement("DELETE FROM auth WHERE userId = ?");
            authStmt.setString(1, userId);
            authStmt.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }   
}
