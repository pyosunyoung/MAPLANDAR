package com.example.maplander_be.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public record ScheduleResponseDto(

        Integer scheduleId,
        Integer groupId,
        Integer creatorId,
        String title,
        LocalDateTime startDatetime,
        LocalDateTime endDatetime,
        String description,
        Double latitude,
        Double longitude,
        String address,
        @JsonProperty("createdAt")
        LocalDateTime createdAt,
        @JsonProperty("updatedAt")
        LocalDateTime updatedAt

) {
}
