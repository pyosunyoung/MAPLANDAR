package com.example.maplander_be.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class FriendId implements Serializable {

    @Column(name = "requester_id")
    private Integer requesterId;


    @Column(name = "receiver_id")
    private Integer receiverId;

}