package com.example.maplander_be.service;

import com.example.maplander_be.domain.User;
import com.example.maplander_be.dto.RegisterDto;
import com.example.maplander_be.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository repo;
    public UserService(UserRepository repo) { this.repo = repo; }

    public boolean isEmailAvailable(String email) {
        return !repo.existsByEmail(email);
    }


    @Transactional
    public User register(RegisterDto dto) {
        if (!isEmailAvailable(dto.email())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }
        if (!dto.password().equals(dto.confirmPassword())) {
            throw new IllegalArgumentException("비밀번호 확인이 일치하지 않습니다.");
        }

        User user = new User(
                dto.name(),
                dto.password(),
                dto.email());
        return repo.save(user);
    }

    public User login(String email, String password) {
        return repo.findByEmail(email)
                .filter(u -> u.getPassword().equals(password))
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다"));

    }

    public User findById(Integer userId){

        return repo.findById(userId).orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

    }

}
