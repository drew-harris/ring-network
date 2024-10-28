package net.drewh.ring_network_users.model;

public class User {
    public String userId;
    public String name;
    public String email;
    public String type;

    public User(String userId, String name, String email, String type) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.type = type;
    }
}
