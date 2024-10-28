package net.drewh.ring_network_users;

import java.util.Map;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;


import net.drewh.ring_network_users.core.*;

public class AppContext {
    public final HikariDataSource dataSource;
    public final Users userRepository;
    public final Auth authRepository;

    public AppContext() {
        HikariConfig config = new HikariConfig();
			  Map<String, String> env = System.getenv();

				config.setDriverClassName("org.postgresql.Driver");  // Add this line
        config.setJdbcUrl(env.get("DB_URL"));
				config.setUsername(env.get("DB_USERNAME"));
				config.setPassword(env.get("DB_PASSWORD"));

        this.dataSource = new HikariDataSource(config);
        
        this.userRepository = new Users(dataSource);
	this.authRepository = new Auth(dataSource);
    }
}
