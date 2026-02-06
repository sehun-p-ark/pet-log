package dev.dhkim.petlog.entities.shop;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "sub_category")
@Getter
@Setter
public class SubCategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String displayText;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private CategoryEntity category;
}
