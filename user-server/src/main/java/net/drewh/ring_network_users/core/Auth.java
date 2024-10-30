package net.drewh.ring_network_users.core;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import com.zaxxer.hikari.HikariDataSource;

import net.drewh.ring_network_users.model.AuthPair;
import net.drewh.ring_network_users.model.User;

public class Auth {
    private final HikariDataSource dataSource;
    private final Users userRepo;

    public Auth(HikariDataSource dataSource, Users userRepo) {
        this.dataSource = dataSource;
        this.userRepo = userRepo;
    }

    public AuthPair getAuthPairByUserId(String userId) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM auth WHERE user_id = ?")) {
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
        PreparedStatement stmt = conn.prepareStatement(
             "INSERT INTO auth (user_id, password) VALUES (?, ?) " +
             "ON CONFLICT (user_id) DO UPDATE SET password = ?")) {
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
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM users WHERE user_id = ?")) {
            stmt.setString(1, userId);
            stmt.executeUpdate();

            PreparedStatement authStmt = conn.prepareStatement("DELETE FROM auth WHERE user_id = ?");
            authStmt.setString(1, userId);
            authStmt.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }   

    public boolean checkPasswordAndUsername(String username, String password) {
        User user = this.userRepo.getUserByUsername(username);
        System.out.println(user);
        if (user == null) {
            return false;
        }
        AuthPair authPair = this.getAuthPairByUserId(user.userId);
        if (authPair == null) {
            return false;
        }

        return authPair.password.equals(password);
        
    }
}
