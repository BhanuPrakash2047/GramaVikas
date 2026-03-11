package com.learn.lld.gramvikash.user.repository;

import com.learn.lld.gramvikash.user.entity.Mandal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MandalRepository extends JpaRepository<Mandal, Long> {
    List<Mandal> findByDistrictId(Long districtId);
}
