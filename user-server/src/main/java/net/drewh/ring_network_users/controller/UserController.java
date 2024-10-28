package net.drewh.ring_network_users.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import net.drewh.ring_network_users.core.Users;
import net.drewh.ring_network_users.model.User;

@RestController
public class UserController {
    private final Users userRepo;

    public UserController(Users userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(this.userRepo.findAll());
    }
}
