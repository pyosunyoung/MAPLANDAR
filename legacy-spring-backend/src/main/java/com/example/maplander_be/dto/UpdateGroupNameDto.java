package com.example.maplander_be.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateGroupNameDto(

        @NotBlank String groupName // 공백이거나 Null이면 안 됨

) {
}
