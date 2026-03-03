package dev.dhkim.petlog.entities.shop;

import lombok.Data;

@Data
public class AdvertisementEntity {
    private int id;
    private String brandName;
    private String imageUrl;
    private String content;
    private int sortOrder;
}
