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

    public User getUserById(String userId) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE user_id = ?")) {
            stmt.setString(1, userId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapUser(rs);
            } else {
                return null;
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public User getUserByUsername(String username) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE name = ?")) {
            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapUser(rs);
            } else {
                return null;
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public User createUser(User user, String password) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO users (user_id, name, email, type) VALUES (?, ?, ?, ?)")) {
            stmt.setString(1, user.userId);
            stmt.setString(2, user.name);
            stmt.setString(3, user.email);
            stmt.setString(4, user.type);
            stmt.executeUpdate();

            PreparedStatement authStmt = conn.prepareStatement("INSERT INTO auth (user_id, password) VALUES (?, ?)");
            authStmt.setString(1, user.userId);
            authStmt.setString(2, password);
            authStmt.executeUpdate();
            return user;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private User mapUser(ResultSet rs) throws SQLException {
        return new User(
            rs.getString("user_id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("type")
        );
    }

}
