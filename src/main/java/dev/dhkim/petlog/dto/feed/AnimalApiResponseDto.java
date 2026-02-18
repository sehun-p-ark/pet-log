package dev.dhkim.petlog.dto.feed;

import lombok.Data;

@Data
public class AnimalApiResponseDto {
    private String id;
    private String url;
    private Integer width;
    private Integer height;
}
