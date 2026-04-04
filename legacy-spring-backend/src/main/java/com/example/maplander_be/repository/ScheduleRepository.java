package com.example.maplander_be.repository;

import com.example.maplander_be.domain.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {

    List<Schedule> findByGroup_GroupId(Integer groupId);
    // Group : Schedule 엔티티의 group 필드
    // GroupId : ListOfGroup의 groupId


    Optional<Schedule> findByGroup_GroupIdAndScheduleId(
            @Param("groupId") Integer groupId,
            @Param("scheduleId") Integer scheduleId
    );

    // 생략해도 되는 부분
    List<Schedule> findByGroup_GroupIdAndEndDatetimeGreaterThanEqualAndStartDatetimeLessThan(
            Integer groupId,
            LocalDateTime dayStart,
            LocalDateTime nextDayStart
    );


    List<Schedule> findByGroup_GroupIdAndStartDatetimeGreaterThanEqualAndStartDatetimeLessThan(

            Integer groupId,
            LocalDateTime dayStart,
            LocalDateTime nextDayStart

    );


}
