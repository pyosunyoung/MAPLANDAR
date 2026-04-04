package com.example.maplander_be.service;

import com.example.maplander_be.domain.*;
import com.example.maplander_be.dto.*;
import com.example.maplander_be.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.maplander_be.domain.Calendar;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional

public class GroupService {

    private final GroupRepository groupRepo;
    private final GroupMemberRepository memberRepo;
    private final UserRepository userRepo;
    private final CalendarRepository calendarRepo;


    public GroupService(GroupRepository groupRepo,
                        GroupMemberRepository memberRepo,
                        UserRepository userRepo,
                        CalendarRepository calendarRepo
                        ){

        this.groupRepo = groupRepo;
        this.memberRepo = memberRepo;
        this.userRepo = userRepo;
        this.calendarRepo = calendarRepo;
    }


    @Transactional(readOnly = true)
    public GroupResponseDto getGroupDetail(Integer userId, Integer groupId) {

        ListOfGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "그룹을 찾을 수 없습니다."));

        boolean isMember = group.getMembers().stream().anyMatch(m -> m.getUser().getUserId().equals(userId));

        if (!isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 그룹의 멤버가 아닙니다.");
        }

        Calendar calendar = calendarRepo.findByGroup(group)  // 멤버 정보 Dto 반환
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "캘린더가 존재하지 않습니다."));

        List<MemberDto> memberDtos = group.getMembers().stream()
                .map(m -> new MemberDto(m.getUser().getUserId(), m.getUser().getName()))
                // userId, name 뽑아내서 MemeberDto 생성
                .collect(Collectors.toList());

        return new GroupResponseDto(
                group.getGroupId(),
                group.getGroupName(),
                group.getOwner().getUserId(),
                calendar.getCalendarId(),
                calendar.getCalendarName(),
                memberDtos,  // Dto로 반환된 멤버 리스트
                group.getCreatedAt()
        );
    }


    /* 그룹 생성 */
    public GroupResponseDto createGroup(Integer ownerId, CreateGroupRequestDto req) {
        User owner = userRepo.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // memberIds 중 ownerId 제거
        List<Integer> filteredMemberIds = req.memberIds().stream()
                .filter(id -> !id.equals(ownerId))  // ownerId와 같은 ID를 제외
                .collect(Collectors.toList());

        // ownerId를 제외한 ID들만 User 엔티티로 매핑
        List<User> invitees = filteredMemberIds.stream().map(id -> userRepo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("초대 대상 없음: " + id))).collect(Collectors.toList());


        // 그룹, 멤버 엔티티 생성
        ListOfGroup group = ListOfGroup.create(owner, req.groupName(), invitees);
        groupRepo.save(group);

        // 기본 캘린더 생성
        Calendar calendar = Calendar.builder()
                .group(group)
                .calendarName(req.calendarName())  // 캘린더 이름 사용자에게 입력받을 수 있도록 수정
                .build();
        calendarRepo.save(calendar);

        // DTO로 변환
        List<MemberDto> memberDtos = group.getMembers().stream()
                .map(m -> new MemberDto(m.getUser().getUserId(), m.getUser().getName()))
                .collect(Collectors.toList());

        return new GroupResponseDto(
                group.getGroupId(),
                group.getGroupName(),
                ownerId,
                calendar.getCalendarId(),
                calendar.getCalendarName(),
                memberDtos,
                group.getCreatedAt()
        );
    }


    /* 내 그룹 목록 조회 */
    public List<GroupResponseDto> listMyGroups(Integer userId) {
        return groupRepo.findAllByMembersUserUserId(userId).stream()
                .map(g -> {
                    Calendar calendar = calendarRepo.findByGroup(g)
                            .orElseThrow(() -> new IllegalArgumentException("캘린더 없음"));
                    List<MemberDto> dtos = g.getMembers().stream()
                            .map(m -> new MemberDto(m.getUser().getUserId(), m.getUser().getName()))
                            .collect(Collectors.toList());
                    return new GroupResponseDto(
                            g.getGroupId(),
                            g.getGroupName(),
                            g.getOwner().getUserId(),
                            calendar.getCalendarId(),
                            calendar.getCalendarName(),
                            dtos,
                            g.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }


    /* 그룹 이름 수정 */
    public GroupNameDto updateGroupName(Integer ownerId, Integer groupId, UpdateGroupNameDto req) {
        ListOfGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다."));

        if (!group.getOwner().getUserId().equals(ownerId)) {
            throw new IllegalStateException("권한이 없습니다.");
        }
        group.setGroupName(req.groupName());

        Calendar calendar = calendarRepo.findByGroup(group)
                .orElseThrow(() -> new IllegalArgumentException("캘린더가 존재하지 않습니다"));
        calendar.setCalendarName(req.groupName());
        calendarRepo.save(calendar);

        return new GroupNameDto(group.getGroupId(), group.getGroupName());
    }


    /*그룹 삭제 */
    public void deleteGroup(Integer ownerId, Integer groupId) {
        ListOfGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다."));
        if (!group.getOwner().getUserId().equals(ownerId)) {
            throw new IllegalStateException("권한이 없습니다.");
        }
        groupRepo.delete(group);
    }

    /*멤버 추가 */
    public List<MemberDto> addMembers(Integer ownerId, Integer groupId, AddMemberRequestDto req) {
        ListOfGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다."));
        if (!group.getOwner().getUserId().equals(ownerId)) {
            throw new IllegalStateException("권한이 없습니다.");
        }
        return req.memberIds().stream()
                .map(id -> {
                    User user = userRepo.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("대상 없음: " + id));
                    group.getMembers().add(GroupMember.of(group, user, Role.MEMBER));
                    return new MemberDto(id, user.getName());
                })
                .collect(Collectors.toList());
    }

    /* 멤버 제거 */
    public void removeMember(Integer ownerId, Integer groupId, Integer memberId) {
        ListOfGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다."));
        if (!group.getOwner().getUserId().equals(ownerId)) {
            throw new IllegalStateException("권한이 없습니다.");
        }
        GroupMemberId gmId = new GroupMemberId(groupId, memberId);
        memberRepo.deleteById(gmId);
    }

    /*그룹 탈퇴 */
    public void leaveGroup(Integer userId, Integer groupId) {
        ListOfGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다."));
        if (group.getOwner().getUserId().equals(userId)) {
            // 소유자가 탈퇴하면 그룹 전체 삭제
            groupRepo.delete(group);
        } else {
            // 일반 멤버 탈퇴
            GroupMemberId gmId = new GroupMemberId(groupId, userId);
            memberRepo.deleteById(gmId);
        }
    }


}
