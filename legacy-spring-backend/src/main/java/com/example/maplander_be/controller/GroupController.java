package com.example.maplander_be.controller;

import com.example.maplander_be.dto.*;
import com.example.maplander_be.service.GroupService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService svc;
    public GroupController(GroupService svc){
        this.svc = svc;
    }


    // 그룹 상세 조회
    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponseDto> detail(
            @PathVariable("groupId") Integer groupId, HttpSession session
    ){
        Integer me = (Integer) session.getAttribute("LOGIN_USER");

        if (me == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        GroupResponseDto dto = svc.getGroupDetail(me,groupId);

        return ResponseEntity.ok(dto);
    }


    // 그룹 생성
    @PostMapping
    public ResponseEntity<GroupResponseDto> create(
            @Valid @RequestBody CreateGroupRequestDto req, HttpSession session) {
        Integer me = (Integer) session.getAttribute("LOGIN_USER");
        GroupResponseDto resp = svc.createGroup(me, req);
        return ResponseEntity.status(201).body(resp);
    }

    // 내 그룹 목록 조회
    @GetMapping
    public ResponseEntity<List<GroupResponseDto>> list(HttpSession session) {
        Integer me = (Integer) session.getAttribute("LOGIN_USER");
        List<GroupResponseDto> groups = svc.listMyGroups(me);
        return ResponseEntity.ok(groups);
    }

    // 그룹 이름 수정
    @PutMapping("/{groupId}")
    public ResponseEntity<GroupNameDto> rename(
            @PathVariable Integer groupId,
            @RequestBody UpdateGroupNameDto req, HttpSession session) {
        Integer me = (Integer) session.getAttribute("LOGIN_USER");
        GroupNameDto dto = svc.updateGroupName(me, groupId, req);
        return ResponseEntity.ok(dto);
    }

    // 그룹 삭제
    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> delete(
            @PathVariable Integer groupId, HttpSession session) {
        Integer me = (Integer) session.getAttribute("LOGIN_USER");
        svc.deleteGroup(me, groupId);
        return ResponseEntity.noContent().build();
    }

    // 멤버 추가
    @PostMapping("/{groupId}/members")
    public ResponseEntity<List<MemberDto>> addMembers(
            @PathVariable Integer groupId,
            @RequestBody AddMemberRequestDto req, HttpSession session) {
        Integer me = (Integer) session.getAttribute("LOGIN_USER");
        List<MemberDto> added = svc.addMembers(me, groupId, req);
        return ResponseEntity.status(201).body(added);
    }

    // 멤버 제거
    @DeleteMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Integer groupId,
            @PathVariable Integer memberId, HttpSession session) {
        Integer me = (Integer) session.getAttribute("LOGIN_USER");
        svc.removeMember(me, groupId, memberId);
        return ResponseEntity.noContent().build();
    }

    // 그룹 탈퇴
    @DeleteMapping("/{groupId}/leave")
    public ResponseEntity<Void> leave(
            @PathVariable Integer groupId, HttpSession session) {
        Integer me = (Integer) session.getAttribute("LOGIN_USER");
        svc.leaveGroup(me, groupId);
        return ResponseEntity.noContent().build();
    }


}
