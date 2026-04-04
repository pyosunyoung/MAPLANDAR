package com.example.maplander_be.controller;

import com.example.maplander_be.dto.CreateGroupRequestDto;
import com.example.maplander_be.dto.CreateScheduleRequestDto;
import com.example.maplander_be.dto.ScheduleResponseDto;
import com.example.maplander_be.service.ScheduleService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/schedules")
public class ScheduleController {

    private final ScheduleService svc;

    public ScheduleController(ScheduleService svc){
        this.svc = svc;
    }


    // 단일 일정 조회
    @GetMapping("/{scheduleId}")
    public ResponseEntity<ScheduleResponseDto> getSchedule(
            @PathVariable Integer groupId,
            @PathVariable Integer scheduleId,
            HttpSession session
    ) {
        Integer me = (Integer) session.getAttribute("LOGIN_USER");
        ScheduleResponseDto dto = svc.getScheduleById(groupId, scheduleId, me);
        return ResponseEntity.ok(dto);
    }

    // 날짜별 일정 조회
    @GetMapping(params = "date")
    public ResponseEntity<List<ScheduleResponseDto>> getSchedulesByDate(
            @PathVariable Integer groupId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            HttpSession session
    ) {
        Integer me = (Integer) session.getAttribute("LOGIN_USER");
        List<ScheduleResponseDto> list = svc.getSchedulesByDate(groupId, date, me);
        return ResponseEntity.ok(list);
    }


    // 그룹별 일정 조회
    @GetMapping
    public ResponseEntity<List<ScheduleResponseDto>> listByGroup(
            @PathVariable Integer groupId, HttpSession session) {

        Integer me = (Integer) session.getAttribute("LOGIN_USER");

        List<ScheduleResponseDto> list = svc.listByGroup(groupId,me);
        return ResponseEntity.ok(list);
    }


    // 일정 생성
    @PostMapping
    public ResponseEntity<ScheduleResponseDto> create(
            @PathVariable Integer groupId,
            @RequestBody CreateScheduleRequestDto req, HttpSession session) {
        Integer me = (Integer) session.getAttribute("LOGIN_USER");
        ScheduleResponseDto dto = svc.create(me, groupId, req);
        return ResponseEntity.status(201).body(dto);
    }


    // 일정 삭제
    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<Void> delete(
            @PathVariable Integer groupId,
            @PathVariable Integer scheduleId, HttpSession session){

        Integer me = (Integer) session.getAttribute("LOGIN_USER");

        svc.delete(scheduleId,me);
        return ResponseEntity.noContent().build();
    }

    // 일정 수정
    @PutMapping("/{scheduleId}")
    public ResponseEntity<ScheduleResponseDto> update(

            @PathVariable Integer groupId,
            @PathVariable Integer scheduleId,
            @Valid @RequestBody CreateScheduleRequestDto req, HttpSession session)

    {
        Integer me = (Integer) session.getAttribute("LOGIN_USER");

        ScheduleResponseDto dto = svc.update(scheduleId, me, req);
        return ResponseEntity.ok(dto);

    }


}
