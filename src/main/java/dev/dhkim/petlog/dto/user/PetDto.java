package dev.dhkim.petlog.dto.user;

import com.fasterxml.jackson.annotation.JsonFormat;
import dev.dhkim.petlog.enums.user.PetBodyType;
import dev.dhkim.petlog.enums.user.PetGenderType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PetDto {
    private int petId;
    private String name;
    private String species;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;
    private PetGenderType gender;
    private String introduction;
    private BigDecimal weight;
    private PetBodyType bodyType;
    private String imageUrl;
    private Boolean isPrimary;
    private LocalDateTime createdAt;
    /*목표 유저, 즉 버튼 클릭 시 “팔로우 대상”의 ID를 저장하는 필드*/
    private Integer userId;

    private Double lat;
    private Double lng;
    private Boolean isFollowing;

    //몇키로 위치 같은 거리 표시 넣을때 필요할숭도
    private Double distanceKm;
}
