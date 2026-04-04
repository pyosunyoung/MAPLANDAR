package com.example.maplander_be.service;

import com.example.maplander_be.domain.Friend;
import com.example.maplander_be.domain.FriendId;
import com.example.maplander_be.domain.User;
import com.example.maplander_be.dto.FriendResponseDto;
import com.example.maplander_be.repository.FriendRepository;
import com.example.maplander_be.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FriendService {

    private final FriendRepository repo;
    private final UserRepository userRepo;

    public FriendService(FriendRepository repo, UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    @Transactional
    public FriendResponseDto sendRequest(Integer requesterId, String receiverEmail) {
        if (requesterId == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        User receiver = userRepo.findByEmail(receiverEmail)
                .orElseThrow(() -> new IllegalArgumentException("요청 대상 이메일을 가진 사용자가 없습니다."));
        Integer receiverId = receiver.getUserId();

        if (requesterId.equals(receiverId)) {
            throw new IllegalArgumentException("자기 자신에게는 요청할 수 없습니다.");
        }

        FriendId id = new FriendId(requesterId, receiverId);
        if (repo.existsById(id)) {
            throw new IllegalArgumentException("이미 요청된 사용자입니다.");
        }

        Friend saved = repo.save(new Friend(requesterId, receiverId, false)); // 요청 저장
        // 수정: 저장된 엔티티를 Dto로 바꿔서 return 함
        return new FriendResponseDto(
                receiverId,
                receiver.getName(),
                saved.getAccepted()
        );
    }

    @Transactional
    public void acceptRequest(Integer requesterId, Integer receiverId) {
        FriendId id = new FriendId(requesterId, receiverId);
        Friend fr = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("요청이 존재하지 않습니다."));
        fr.setAccepted(true);
        repo.save(fr);
    }

    @Transactional
    public void declineRequest(Integer requesterId, Integer receiverId) {
        FriendId id = new FriendId(requesterId, receiverId);
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("요청이 존재하지 않습니다.");
        }
        repo.deleteById(id);
    }

    public List<Friend> getPendingRequests(Integer userId) {
        return repo.findByIdReceiverIdAndAcceptedFalse(userId);
    }

    // 수정: 대기 중인 요청을 FriendResponseDto로 변환해 반환하는 메서드 추가
    public List<FriendResponseDto> getPendingRequestsDto(Integer me) {
        return repo.findByIdReceiverIdAndAcceptedFalse(me).stream()
                .map(fr -> {
                    Integer requesterId = fr.getId().getRequesterId();
                    User requester = userRepo.findById(requesterId)
                            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
                    return new FriendResponseDto(
                            requesterId,
                            requester.getName(),
                            fr.getAccepted()  // 항상 false
                    );
                })
                .toList();
    }

    public List<Friend> getFriends(Integer userId) {
        return repo.findByIdRequesterIdAndAcceptedTrueOrIdReceiverIdAndAcceptedTrue(userId, userId);
    }

    public List<FriendResponseDto> getFriendList(Integer me) {
        List<Friend> relations = repo.findByIdRequesterIdAndAcceptedTrueOrIdReceiverIdAndAcceptedTrue(me, me);
        return relations.stream()
                .map(rel -> {
                    Integer friendId = rel.getId().getRequesterId().equals(me)
                            ? rel.getId().getReceiverId()
                            : rel.getId().getRequesterId();
                    User friend = userRepo.findById(friendId)
                            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
                    return new FriendResponseDto(
                            friendId,
                            friend.getName(),
                            rel.getAccepted()
                    );
                })
                .toList();
    }


    }



