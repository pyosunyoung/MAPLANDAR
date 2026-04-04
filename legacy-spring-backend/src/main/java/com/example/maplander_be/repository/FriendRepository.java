package com.example.maplander_be.repository;

import com.example.maplander_be.domain.Friend;
import com.example.maplander_be.domain.FriendId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendRepository extends JpaRepository<Friend, FriendId> {


    List<Friend> findByIdReceiverIdAndAcceptedFalse(Integer receiverId);
    List<Friend> findByIdRequesterIdOrIdReceiverIdAndAcceptedTrue(Integer requesterId, Integer receiverId);


    List<Friend> findByIdRequesterIdAndAcceptedTrueOrIdReceiverIdAndAcceptedTrue(
            Integer requesterId,
            Integer receiverId
    );

}
