package com.example.maplander_be.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ListOfGroup")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder

public class ListOfGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Integer groupId;

    @Column(name = "group_name", nullable = false, length = 100)
    private String groupName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default  // 새로 추가
    private List<GroupMember> members = new ArrayList<>();

    // null 방지용(필수 X)
    @PrePersist
    private void onCreate(){
        if (createdAt == null){
            createdAt = LocalDateTime.now();
        }
    }

    public static ListOfGroup create(User owner, String groupName, List<User> initialMembers) {
        ListOfGroup group = ListOfGroup.builder()
                .owner(owner)
                .groupName(groupName)
                .build();

        group.members.add(GroupMember.of(group, owner, Role.OWNER));
        initialMembers.forEach(u ->
                group.members.add(GroupMember.of(group, u, Role.MEMBER))
        );
        return group;
    }

}
