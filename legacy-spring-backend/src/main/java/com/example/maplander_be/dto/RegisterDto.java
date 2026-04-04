package com.example.maplander_be.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterDto(

        @NotBlank  String name,
        String password,
        String confirmPassword,
        @Email(message = "이메일 형식이 올바르지 않습니다") String email
){}
