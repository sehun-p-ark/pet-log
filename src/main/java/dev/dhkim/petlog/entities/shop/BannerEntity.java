package dev.dhkim.petlog.entities.shop;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "banner")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BannerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(name = "category_id")
    private Integer categoryId;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "device_type", nullable = false, length = 10)
    private String deviceType = "web";

    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType = "category";

    @Column(name = "brand_name", length = 50)
    private String brandName;
}