package com.example.maplander_be.dto;

public record ApiResponseDto<T>(

        int status,
        T data,
        String message


) {
}
