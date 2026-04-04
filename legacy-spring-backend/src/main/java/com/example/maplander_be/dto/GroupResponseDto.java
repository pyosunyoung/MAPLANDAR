package com.example.maplander_be.dto;

import java.time.LocalDateTime;
import java.util.List;

public record GroupResponseDto(

    Integer groupId,
    String groupName,
    Integer ownerId,
    Integer calendarId,
    String calendarName,
    List<MemberDto> members,
    LocalDateTime createdAt

)

{}
