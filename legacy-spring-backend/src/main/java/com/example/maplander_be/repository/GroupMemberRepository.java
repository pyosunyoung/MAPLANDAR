package com.example.maplander_be.repository;

import com.example.maplander_be.domain.GroupMember;
import com.example.maplander_be.domain.GroupMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {


}
