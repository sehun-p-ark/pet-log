package dev.dhkim.petlog.entities.shop;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "banner_target")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BannerTargetEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType;

    @Column(name = "category_id")
    private Integer categoryId;

    @Column(name = "display_type", nullable = false, length = 10)
    private String displayType;
}