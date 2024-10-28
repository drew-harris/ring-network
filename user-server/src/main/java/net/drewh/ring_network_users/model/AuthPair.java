package net.drewh.ring_network_users.model;

public class AuthPair {
    public String userId;
    public String password;

    public AuthPair(String userId, String password) {
        this.userId = userId;
        this.password = password;
    }
}
