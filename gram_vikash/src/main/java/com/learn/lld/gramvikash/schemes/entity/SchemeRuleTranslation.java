package com.learn.lld.gramvikash.schemes.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "scheme_rule_translations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"rule_id", "language"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchemeRuleTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rule_id", nullable = false)
    private SchemeEligibilityRule rule;

    @Column(nullable = false, length = 5)
    private String language;  // EN, HI, TE

    @Column(columnDefinition = "TEXT")
    private String displayText;  // human-readable rule description in this language
}
