package com.example.maplander_be.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Friend")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Friend {  // @IdClass 에서 @EmbeddedId로 변경

    // 복합 키로 FriendId 사용
    @EmbeddedId
    private FriendId id;

    // 수락 여부
    @Column(name = "is_accepted", nullable = false)
    private Boolean accepted;


    public Friend(Integer requesterId, Integer receiverId, Boolean accepted) {
        this.id       = new FriendId(requesterId, receiverId);
        this.accepted = accepted;
    }


}