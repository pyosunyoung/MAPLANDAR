package com.example.maplander_be.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AddMemberRequestDto(

        @Size(min = 1) List<@NotNull Integer> memberIds

) {
}
