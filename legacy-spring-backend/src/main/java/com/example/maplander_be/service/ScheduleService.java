package com.example.maplander_be.service;

import com.example.maplander_be.domain.ListOfGroup;
import com.example.maplander_be.domain.Schedule;
import com.example.maplander_be.dto.CreateScheduleRequestDto;
import com.example.maplander_be.dto.ScheduleResponseDto;
import com.example.maplander_be.repository.GroupRepository;
import com.example.maplander_be.repository.ScheduleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ScheduleService {

    private final ScheduleRepository scheduleRepo;
    private final GroupRepository groupRepo;

    public ScheduleService(ScheduleRepository scheduleRepo, GroupRepository groupRepo) {
        this.scheduleRepo = scheduleRepo;
        this.groupRepo = groupRepo;
    }


    // 스케줄 생성
    public ScheduleResponseDto create(Integer ownerId, Integer groupId, CreateScheduleRequestDto req) {
        ListOfGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"그룹이 없습니다."));

        boolean isMember = group.getMembers().stream().anyMatch(m -> m.getUser().getUserId().equals(ownerId));

        if (!isMember){

            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"해당 그룹의 멤버가 아닙니다");

        }


        // 엔티티 생성, 저장
        Schedule sch = new Schedule(
                group, ownerId,
                req.title(),
                req.startDatetime(),
                req.endDatetime(),
                req.description(),
                req.latitude(),
                req.longitude(),
                req.address()
        );
        Schedule saved = scheduleRepo.save(sch);

        // Dto로 변환 후 리턴함
        return new ScheduleResponseDto(
                saved.getScheduleId(),
                saved.getGroup().getGroupId(),
                saved.getCreatorId(),
                saved.getTitle(),
                saved.getStartDatetime(),
                saved.getEndDatetime(),
                saved.getDescription(),
                saved.getLatitude(),
                saved.getLongitude(),
                saved.getAddress(),
                saved.getCreatedAt(),
                saved.getUpdatedAt()
        );
    }

    // 그룹별 스케줄 조회
    public List<ScheduleResponseDto> listByGroup(Integer groupId, Integer userId) {

        ListOfGroup group = groupRepo.findById(groupId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND,"그룹이 없습니다"));

        boolean isMember = group.getMembers().stream().anyMatch(m -> m.getUser().getUserId().equals(userId));
        if (!isMember){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"해당 그룹의 멤버가 아닙니다");
        }


        return scheduleRepo.findByGroup_GroupId(groupId).stream()
                .map(s -> new ScheduleResponseDto(
                        s.getScheduleId(),
                        s.getGroup().getGroupId(),
                        s.getCreatorId(),
                        s.getTitle(),
                        s.getStartDatetime(),
                        s.getEndDatetime(),
                        s.getDescription(),
                        s.getLatitude(),
                        s.getLongitude(),
                        s.getAddress(),
                        s.getCreatedAt(),
                        s.getUpdatedAt()
                ))
                .toList();
    }


    // 단일 일정 조회
    public ScheduleResponseDto getScheduleById(

            Integer groupId,
            Integer scheduleId,
            Integer currentUserId

    ) {

        ListOfGroup group = groupRepo.findById(groupId).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "그룹이 없습니다"));

        boolean isMember = group.getMembers().stream()
                .anyMatch(m -> m.getUser().getUserId().equals(currentUserId));
        if (!isMember) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "해당 그룹의 멤버가 아닙니다");

        }

        Schedule s = scheduleRepo.findByGroup_GroupIdAndScheduleId(groupId, scheduleId).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND,"해당 일정이 존재하지 않습니다"));


        // DTO 변환해서 반환
        return new ScheduleResponseDto(
                s.getScheduleId(),
                s.getGroup().getGroupId(),
                s.getCreatorId(),
                s.getTitle(),
                s.getStartDatetime(),
                s.getEndDatetime(),
                s.getDescription(),
                s.getLatitude(),
                s.getLongitude(),
                s.getAddress(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );

    }

    // 날짜별 일정 조회
    public List<ScheduleResponseDto> getSchedulesByDate(

            Integer groupId,
            LocalDate targetDate,
            Integer currentUserId

    ){

        ListOfGroup group = groupRepo.findById(groupId).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND,"그룹이 없습니다"));

        boolean isMember = group.getMembers().stream().anyMatch(m -> m.getUser().getUserId().equals(currentUserId));

        if (!isMember){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"해당 그룹의 멤버가 아닙니다");
        }

        LocalDateTime dayStart = targetDate.atStartOfDay();
        LocalDateTime nextDayStart = dayStart.plusDays(1);


        List<Schedule> schedules = scheduleRepo.findByGroup_GroupIdAndStartDatetimeGreaterThanEqualAndStartDatetimeLessThan(

                groupId, dayStart, nextDayStart

        );

        // DTO 목록으로 변환 후 반환
        return schedules.stream()
                .map(s -> new ScheduleResponseDto(
                        s.getScheduleId(),
                        s.getGroup().getGroupId(),
                        s.getCreatorId(),
                        s.getTitle(),
                        s.getStartDatetime(),
                        s.getEndDatetime(),
                        s.getDescription(),
                        s.getLatitude(),
                        s.getLongitude(),
                        s.getAddress(),
                        s.getCreatedAt(),
                        s.getUpdatedAt()
                ))
                .toList();

    }


    // 스케줄 삭제
    public void delete(Integer scheduleId, Integer userId) {

        Schedule sch = scheduleRepo.findById(scheduleId).orElseThrow(()->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "일정을 찾을 수 없습니다"));

        // 일정 생성자만 삭제 가능함
        if (!sch.getCreatorId().equals(userId)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"일정 삭제 권한이 없습니다");
        }

        scheduleRepo.delete(sch);
    }


    // 일정 수정
    public ScheduleResponseDto update(Integer scheduleId, Integer userId, CreateScheduleRequestDto req){

        Schedule sch = scheduleRepo.findById(scheduleId).orElseThrow(()
                -> new ResponseStatusException(HttpStatus.NOT_FOUND, "일정을 찾을 수 없습니다"));

        // 수정: 생성자 권한 확인
        if (!sch.getCreatorId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "일정 수정 권한이 없습니다.");
        }

        // 수정: DTO 값으로 엔티티 필드 업데이트
        sch.setTitle(req.title());
        sch.setStartDatetime(req.startDatetime());
        sch.setEndDatetime(req.endDatetime());
        sch.setDescription(req.description());
        sch.setLatitude(req.latitude());
        sch.setLongitude(req.longitude());
        sch.setAddress(req.address());

        // 수정된 엔티티 save 함
        Schedule updated = scheduleRepo.save(sch);

        // Dto로 바꾼 후 리턴 함
        return new ScheduleResponseDto(
                updated.getScheduleId(),
                updated.getGroup().getGroupId(),
                updated.getCreatorId(),
                updated.getTitle(),
                updated.getStartDatetime(),
                updated.getEndDatetime(),
                updated.getDescription(),
                updated.getLatitude(),
                updated.getLongitude(),
                updated.getAddress(),
                updated.getCreatedAt(),
                updated.getUpdatedAt()
        );

    }

}
