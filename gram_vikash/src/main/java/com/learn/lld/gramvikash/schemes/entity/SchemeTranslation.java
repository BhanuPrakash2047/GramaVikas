package com.learn.lld.gramvikash.schemes.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "scheme_translations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"scheme_id", "language"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchemeTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "scheme_id", nullable = false)
    private Scheme scheme;

    @Column(nullable = false, length = 5)
    private String language;  // EN, HI, TE

    @Column(columnDefinition = "TEXT")
    private String schemeName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String benefitDetails;
}
