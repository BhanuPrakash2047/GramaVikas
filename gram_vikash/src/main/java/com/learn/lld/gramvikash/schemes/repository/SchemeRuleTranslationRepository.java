package com.learn.lld.gramvikash.schemes.repository;

import com.learn.lld.gramvikash.schemes.entity.SchemeRuleTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SchemeRuleTranslationRepository extends JpaRepository<SchemeRuleTranslation, Long> {

    Optional<SchemeRuleTranslation> findByRuleIdAndLanguage(Long ruleId, String language);
}
