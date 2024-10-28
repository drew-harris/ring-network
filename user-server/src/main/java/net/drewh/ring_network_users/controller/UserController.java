package net.drewh.ring_network_users.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import net.drewh.ring_network_users.core.Auth;
import net.drewh.ring_network_users.core.Users;
import net.drewh.ring_network_users.model.User;

@RestController
public class UserController {
    private final Users userRepo;
    private final Auth authRepo;

    public UserController(Users userRepo, Auth authRepo) {
        this.userRepo = userRepo;
        this.authRepo = authRepo;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(this.userRepo.findAll());
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@org.springframework.web.bind.annotation.PathVariable("userId") String userId) {
        this.authRepo.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{userId}/password")
    public ResponseEntity<Void> updatePassword(@org.springframework.web.bind.annotation.PathVariable("userId") String userId,
                                               @org.springframework.web.bind.annotation.RequestBody String password) {
        this.authRepo.updatePassword(userId, password);
        return ResponseEntity.ok().build();
    }

    private static class CreateUserRequest {
        private User user;
        private String password;
    }

    @PostMapping("/users")
    public ResponseEntity<Void> createUser(@org.springframework.web.bind.annotation.RequestBody CreateUserRequest request) {
        this.userRepo.createUser(request.user, request.password);
        return ResponseEntity.ok().build();
    }
}
