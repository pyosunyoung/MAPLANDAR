package com.example.maplander_be.repository;

import com.example.maplander_be.domain.ListOfGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GroupRepository extends JpaRepository<ListOfGroup, Integer> {

    List<ListOfGroup> findAllByMembersUserUserId(Integer userId);


}
