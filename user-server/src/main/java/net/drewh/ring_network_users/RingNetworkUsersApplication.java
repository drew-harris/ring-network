package net.drewh.ring_network_users;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.Bean;

import net.drewh.ring_network_users.core.Auth;
import net.drewh.ring_network_users.core.Users;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class RingNetworkUsersApplication {
	    private static AppContext context = new AppContext();

	public static void main(String[] args) {
		SpringApplication.run(RingNetworkUsersApplication.class, args);
	}

	@Bean
	public Users userRepository() {
			return context.userRepository;
	}

	@Bean
	public Auth authRepository() {
			return context.authRepository;
	}
}
