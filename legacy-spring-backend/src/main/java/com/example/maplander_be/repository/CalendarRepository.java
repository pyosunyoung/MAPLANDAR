package com.example.maplander_be.repository;

import com.example.maplander_be.domain.ListOfGroup;
import org.springframework.data.jpa.repository.JpaRepository;


import com.example.maplander_be.domain.Calendar;
import java.util.List;
import java.util.Optional;

public interface CalendarRepository extends JpaRepository<Calendar, Integer> {


    Optional<Calendar> findByGroup(ListOfGroup group);

    List<Calendar> findByGroup_GroupId(Integer groupId);

}
