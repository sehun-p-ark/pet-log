package dev.dhkim.petlog.entities.shop;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "product")
@Getter
@Setter
public class ProductEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String brand;
    private String name;
    private Integer price;
    private Integer discountRate;
    private Integer deliveryFee;
    private Integer stock;
    private String petType;

    @ManyToOne
    @JoinColumn(name = "sub_category_id")
    private SubCategoryEntity subCategory;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
