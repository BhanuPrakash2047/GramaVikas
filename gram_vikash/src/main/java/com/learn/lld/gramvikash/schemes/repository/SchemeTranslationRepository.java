package com.learn.lld.gramvikash.schemes.repository;

import com.learn.lld.gramvikash.schemes.entity.SchemeTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SchemeTranslationRepository extends JpaRepository<SchemeTranslation, Long> {

    Optional<SchemeTranslation> findBySchemeIdAndLanguage(Long schemeId, String language);
}
