package com.example.maplander_be.dto;

public record FriendResponseDto(
        Integer userId,
        String name,
        Boolean accepted  // 친구 수락 여부 (List 조회 시 true)
) {}