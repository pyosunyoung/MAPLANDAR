package com.example.maplander_be.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateGroupRequestDto(

        @NotBlank String groupName,  // groupName은 공백이면 안 됨
        @NotBlank String calendarName,
        @Size(min = 1) List<@NotNull Integer> memberIds // memberIds는 null이거나 공백이면 안 됨

        ) {
}
