package net.drewh.ring_network_users.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import net.drewh.ring_network_users.core.Users;

@RestController
public class UserController {
    private final Users userRepo;

    public UserController(Users userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/users")
    public ResponseEntity<String> getUsers() {
        return ResponseEntity.ok(this.userRepo.test());
    }
}
