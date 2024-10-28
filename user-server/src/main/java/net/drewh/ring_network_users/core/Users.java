package net.drewh.ring_network_users.core;

import com.zaxxer.hikari.HikariDataSource;

public class Users {
    private final HikariDataSource dataSource;

    public Users(HikariDataSource dataSource) {
        this.dataSource = dataSource;
    }

    public String test() {
        return "test";
    }


}
