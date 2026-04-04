package com.example.maplander_be.domain;

import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDateTime;
import com.example.maplander_be.domain.Role;

@Entity
@Table(name = "GroupMember")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder

public class GroupMember {

    @EmbeddedId
    private GroupMemberId id;

    @MapsId("groupId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private ListOfGroup group;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    public static GroupMember of(ListOfGroup group, User user, Role role) {
        GroupMember gm = GroupMember.builder()
                .group(group)
                .user(user)
                .role(role)
                .build();
        // 복합키 설정
        gm.id = new GroupMemberId(group.getGroupId(), user.getUserId());
        return gm;
    }

}
