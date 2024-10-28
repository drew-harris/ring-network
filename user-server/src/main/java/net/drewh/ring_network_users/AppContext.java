package net.drewh.ring_network_users;

import java.util.Map;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;


import net.drewh.ring_network_users.core.*;

public class AppContext {
    public final HikariDataSource dataSource;
    public final Users userRepository;

    public AppContext() {
        HikariConfig config = new HikariConfig();
			  Map<String, String> env = System.getenv();

				System.out.println("DB_URL: " + env.get("DB_URL"));
				System.out.println("DB_USERNAME: " + env.get("DB_USERNAME"));
				System.out.println("DB_PASSWORD: " + env.get("DB_PASSWORD"));


				config.setDriverClassName("org.postgresql.Driver");  // Add this line
        config.setJdbcUrl(env.get("DB_URL"));
				config.setUsername(env.get("DB_USERNAME"));
				config.setPassword(env.get("DB_PASSWORD"));

				System.out.println("Final JDBC URL: " + config.getJdbcUrl());
System.out.println("Final Username: " + config.getUsername());
        this.dataSource = new HikariDataSource(config);
        
        this.userRepository = new Users(dataSource);
    }
}
