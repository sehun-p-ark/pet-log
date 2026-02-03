package dev.dhkim.petlog.main.repository;

import dev.dhkim.petlog.main.entities.HospitalEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HospitalRepository extends JpaRepository<HospitalEntity, Long> {
    boolean existsByManageNo(String manageNo); // 중복 체크용

}
