package com.example.maplander_be.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CreateScheduleRequestDto(

        @NotBlank String title,
        String description,
        @NotBlank String address,
        @NotNull Double latitude,
        @NotNull Double longitude,
        @NotNull LocalDateTime startDatetime,
        @NotNull LocalDateTime endDatetime

) {}
